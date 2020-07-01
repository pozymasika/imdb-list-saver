import * as React from "react";
import "../styles/app.scss";

type Props = {
  Component: React.ComponentClass;
  pageProps: any;
};

export default function MyApp({ Component, pageProps }: Props) {
  return <Component {...pageProps} />;
}
