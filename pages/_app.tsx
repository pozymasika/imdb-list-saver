import * as React from "react";
import "../styles/app.scss";
import "react-input-range/lib/css/index.css";

type Props = {
  Component: React.ComponentClass;
  pageProps: any;
};

export default function MyApp({ Component, pageProps }: Props) {
  return <Component {...pageProps} />;
}
