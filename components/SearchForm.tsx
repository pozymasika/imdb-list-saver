import * as React from "react";
import styled from "styled-components";
import { IMDB_URL } from "../constants";
import { ListData } from "../types";
import { link } from "fs";

type Props = {
  className?: string;
};

function SearchForm({ className }: Props) {
  const [isLoading, setLoading] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [data, setData] = React.useState<ListData | undefined>();

  function onSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setLoading(true);
    const parsedUrl = new URL(url);
    console.log("parsed: ", parsedUrl);
    if (parsedUrl.origin !== IMDB_URL) {
      return false;
    }

    const [_, listId] = parsedUrl.pathname
      .substring(1, parsedUrl.pathname.length - 1)
      .split("/");
    console.log("listId: ", listId);
    fetch(`/api/lists/${listId}`, {
      method: "POST",
    })
      .then((resp) => {
        return resp.json().then((data) => {
          setData(data);
          return data;
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  console.log("data", data);

  return (
    <div className={className}>
      <form method="get" className="form-inline" onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="url" className="sr-only">
            Url:
          </label>
          <input
            type="text"
            name="url"
            onChange={(e) => setUrl(e.target.value)}
            className="form-control"
            disabled={isLoading}
            id="url"
          />
        </div>
        <div className="form-group ml-2">
          <label htmlFor="submitBtn" className="sr-only">
            Submit:
          </label>
          <input
            type="submit"
            className="form-control"
            disabled={isLoading}
            value={isLoading ? "Loading..." : "Submit"}
            id="submitBtn"
          />
        </div>
      </form>
      {data ? (
        <div className="mt-3">
          <h2>{data.title}</h2>
          <ul className="list-unstyled">
            {data.items.map((item, idx) => (
              <li className="media" key={"media-item-" + idx}>
                <img src={item.image} alt={item.image} className="mr-3" />
                <div className="media-body">
                  <h2 className="title">
                    {item.title} -{" "}
                    <span className="text-muted">{item.year}</span>
                  </h2>
                  <div className="flex">
                    <span className="rated">{item.rated}</span>
                    <span className="runtime">{item.runtime}</span>
                    <span className="genres">
                      <ul className="list-unstyled">
                        {item.genres.map((genre) => (
                          <li className="badge">{genre}</li>
                        ))}
                      </ul>
                    </span>
                  </div>
                  <div className="rating">{item.rating}</div>
                  <p className="description">{item.description}</p>
                  {item.directors && (
                    <div className="directors">
                      <p>Directors: </p>
                      <ul className="list-unstyled">
                        {item.directors.map((director) => (
                          <li className="badge">{director}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {item.stars && (
                    <div className="stars">
                      <p>stars: </p>
                      <ul className="list-unstyled">
                        {item.stars.map((star) => (
                          <li className="badge">{star}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default styled(SearchForm)``;
