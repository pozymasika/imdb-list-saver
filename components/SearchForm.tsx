import * as React from "react";
import styled from "styled-components";
import slugify from "slugify";
import domToImage from "dom-to-image";
import fileSaver from "file-saver";
import InputRange, { Range } from "react-input-range";
import { ListData, ListItem } from "../types";

type Props = {
  className?: string;
};

function SearchForm({ className }: Props) {
  const [isLoading, setLoading] = React.useState(false);
  const [isExporting, setExporting] = React.useState(false);
  const [data, setData] = React.useState<ListData | undefined>();
  const [moviesToShow, setMoviesToShow] = React.useState<Range | number>(1);
  const [url, setUrl] = React.useState("");
  const [error, setError] = React.useState<
    Partial<{ message: string; code: number }>
  >();
  const domRef = React.useRef<HTMLDivElement>(null);

  function onSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setLoading(true);

    fetch(`/api/lists`, {
      method: "POST",
      body: JSON.stringify({ url }),
    })
      .then((resp) => {
        return resp.json().then((data) => {
          if (data.error) {
            setData(undefined);
            return setError(data.error);
          }

          setMoviesToShow({
            min: 1,
            max: data.items.length,
          });
          setData(data);
          setError(undefined);
          return data;
        });
      })
      .catch(() => setError({ message: "Unknown Error Occured" }))
      .finally(() => {
        setLoading(false);
      });
  }

  function onSaveImgClick() {
    if (!domRef.current) return false;
    setExporting(true);
    domToImage
      .toBlob(domRef.current)
      .then((blob) => {
        fileSaver.saveAs(
          blob,
          `${slugify(data?.title || "imdb-list-export", { lower: true })}.png`
        );
      })
      .finally(() => setExporting(false));
  }

  let filteredItems: ListItem[] = [];
  if (data) {
    filteredItems = data.items.filter((item, idx) => {
      if (typeof moviesToShow !== "number") {
        item.itemIdx = idx + 1;
        return (
          item.itemIdx >= moviesToShow.min && item.itemIdx <= moviesToShow.max
        );
      }
      return true;
    });
  }

  return (
    <div
      className={
        className +
        " d-flex flex-column justify-content-center pt-4 pl-2 pr-2 w-100"
      }
    >
      <h3> IMDb List Exporter </h3>
      <p className="app-desc">
        This tool exports IMDb lists into a nicely formatted PNG image. Just{" "}
        paste the list below and we'll fetch it from IMDb and export for you.
      </p>
      <ul className="app-desc list-unstyled">
        <li> Some notes: </li>
        <li className="ml-3">
          The list url should be in the formats{" "}
          <code>https://www.imdb.com/list/ls080427652/</code> or{" "}
          <code>
            https://www.imdb.com/search/title/?groups=top_250&sort=user_rating
          </code>
        </li>
        <li className="ml-3">
          <a href="https://www.imdb.com/user/ur23892615/lists">Click here</a> to
          browser through IMDb editor lists
        </li>
      </ul>
      <div className="d-flex flex-column flex-sm-row pt-3 pb-3">
        <form method="get" className="form-inline" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="url" className="sr-only">
              IMDB List URL:
            </label>
            <input
              type="text"
              name="url"
              onChange={(e) => setUrl(e.target.value)}
              className="form-control mb-1"
              placeholder="https://www.imdb.com/list/ls002448041/"
              id="url"
              required
            />
          </div>
          <div className="form-group ml-2">
            <label htmlFor="submitBtn" className="sr-only">
              Submit:
            </label>
            <input
              type="submit"
              className="form-control btn btn-primary mb-1"
              disabled={isLoading}
              value={isLoading ? "Loading..." : "Get List"}
              id="submitBtn"
            />
          </div>
        </form>
        <div className="actions">
          {data && (
            <button
              className="btn btn-link ml-2"
              onClick={onSaveImgClick}
              disabled={isExporting}
            >
              {isExporting ? "Downloading..." : "Download Image"}
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="d-flex flex-column alert alert-error">
          {error.code === 404 ? "Failed to find list" : "Error retrieving list"}
          . Please try again {error.message && <code>{error.message} </code>}
        </div>
      )}
      {data ? (
        <>
          <div className="d-flex flex-column pt-3 pb-3">
            <p className="text-italic">
              Use the slider below to select movies you want to appear in the{" "}
              image
            </p>
            <InputRange
              formatLabel={(value) => `#${value}`}
              minValue={1}
              maxValue={data.items.length}
              value={moviesToShow}
              onChange={(value) => setMoviesToShow(value)}
              onChangeComplete={(value) => console.log(value)}
            />
          </div>
          <div className="pt-3 pb-3 list-results" ref={domRef}>
            <h2 className="font-weight-bold mb-4">{data.title}</h2>
            <ul className="list-unstyled">
              {filteredItems.map((item, idx) => (
                <li className="list-item p-3" key={"media-item-" + idx}>
                  <div className="media">
                    <div
                      className="media-img mr-2"
                      data-rank={`#${item.itemIdx || idx + 1}`}
                    >
                      <img src={item.image} alt={item.image} />
                    </div>
                    <div className="media-body">
                      <p className="title font-weight-bold mb-1">
                        {item.title} -{" "}
                        <span className="text-muted">{item.year}</span>
                      </p>
                      <div className="d-flex mb-1">
                        {/* <span className="rated stat mr-1">{item.rated}</span> */}
                        <span className="rating text-primary font-weight-bold">
                          {item.rating} stars
                        </span>
                        <span className="dot font-weight-bold ml-1 mr-1">
                          /
                        </span>
                        <span className="runtime text-secondary mr-1">
                          {item.runtime}
                        </span>
                      </div>
                      <div className="genres mb-1">
                        <ul className="list-unstyled">
                          {item.genres.map((genre) => (
                            <li
                              className={"badge " + genre.toLowerCase()}
                              key={genre}
                            >
                              {genre}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {item.directors && (
                        <div className="directors">
                          <p className="mb-1">
                            Directed by{" "}
                            {item.directors.map((director) => (
                              <span key={director}>{director}</span>
                            ))}
                          </p>
                        </div>
                      )}
                      {item.stars && (
                        <div className="stars">
                          <p className="mb-1 font-italic">
                            {item.stars.map((star, idx) => (
                              <span key={star}>
                                {star}
                                {idx < item.stars!.length - 1 ? " / " : ""}
                              </span>
                            ))}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="description mt-1">{item.description}</p>
                  <hr className="mt-1 mb-1" />
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default styled(SearchForm)`
  min-height: 100vh;
  max-width: 700px;
  #url {
    min-width: 350px;
    @media (max-width: 350px) {
      min-width: 100%;
    }
  }
  .input-range {
    max-width: 350px;
  }
  .app-desc {
    max-width: 700px;
  }
  .alert {
    overflow-y: auto;
    max-height: 300px;
  }
  .list-results {
    max-width: 600px;
    background-color: #fff;
    .media-img {
      position: relative;
      img {
        width: 83px;
      }
      &:before {
        content: attr(data-rank);
        position: absolute;
        height: 40px;
        width: 40px;
        left: -20px;
        top: -20px;
        border-radius: 20px;
        background-color: #670833;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-size: 1.2rem;
      }
    }
  }
`;
