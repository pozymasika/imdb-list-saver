import { NextApiResponse, NextApiRequest } from "next";
import request from "request-promise";
import cheerio from "cheerio";
import { IMDB_BASE_LIST_URL, IMDB_URL } from "../../../constants";
import { ListData } from "../../../types";

export default function (req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
  } = req;
  const url = IMDB_BASE_LIST_URL + `/${id}/`;
  return request
    .get(url, {
      headers: {
        Origin: IMDB_URL,
      },
    })
    .then(
      (html: string) => {
        const $ = cheerio.load(html);
        const listTitle = $("#pagecontent h1.header.list-name").text();
        let listData: ListData = {
          title: listTitle,
          items: [],
        };
        $(".lister > .lister-list .lister-item").each((_idx, el) => {
          let rating = parseFloat(
            $(".lister-item-content span.ipl-rating-star__rating", el).text()
          );
          // we get text like this:
          // \n Director:\nStanley Kubrick\n | \n    Stars:\nMalcolm McDowell, \nPatrick Magee, \nMichael Bates, \nWarren Clarke\n
          // so we just manipulate it to get directors and stars
          const directorAndStarsText = $(
            ".lister-item-content .ratings-metascore",
            el
          )
            .next()
            .next()
            .text();
          const [directors, stars] = directorAndStarsText.split("|");
          let movieData = {
            title: $(".lister-item-header a", el).text(),
            year: $(".lister-item-header > .lister-item-year", el).text(),
            rated: $(".lister-item-content .certificate", el).text(),
            runtime: $(".lister-item-content .runtime", el).text(),
            genres: $(".lister-item-content .genre", el).text().split(","),
            rating: rating > 10 ? (rating / 100) * 10 : rating,
            metascore: $(
              ".lister-item-content .metascore.favorable",
              el
            ).text(),
            description: $(".lister-item-content .ratings-metascore", el)
              .next()
              .text(),
            directors: directors?.split(":")[1]?.split(","),
            stars: stars?.split(":")[1]?.split(","),
            // the image is lazyloaded, real image is in loadlate attr
            image: $(".lister-item-image img", el).attr("loadlate"),
          };
          listData.items.push(movieData);
        });
        return res.status(200).json(listData);
      },
      (error) => res.status(error.statusCode).json({ error })
    );
}
