import Head from "next/head";
import SearchForm from "../components/SearchForm";

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title> IMDb List Exporter </title>
      </Head>
      <div className="row justify-content-center">
        <SearchForm />
      </div>
    </div>
  );
}
