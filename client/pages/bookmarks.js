import React from "react";
import getConfig from "next/config";
import { useRouter } from "next/router";
import qs from "qs";
import { withAuthServerSideProps } from "../utils/withAuth";
import SEO from "../components/SEO";
import Text from "../components/Text";
import TorrentList from "../components/TorrentList";

const Bookmarks = ({ results }) => {
  const {
    publicRuntimeConfig: { SQ_TORRENT_CATEGORIES },
  } = getConfig();

  return (
    <>
      <SEO title="Your bookmarks" />
      <Text as="h1" mb={5}>
        Your bookmarks
      </Text>
      {results.torrents.length ? (
        <TorrentList
          torrents={results.torrents}
          categories={SQ_TORRENT_CATEGORIES}
          total={results.total}
        />
      ) : (
        <Text color="grey">You do not have any bookmarks.</Text>
      )}
    </>
  );
};

export const getServerSideProps = withAuthServerSideProps(
  async ({ token, fetchHeaders }) => {
    if (!token) return { props: {} };

    const {
      publicRuntimeConfig: { SQ_API_URL },
    } = getConfig();

    try {
      const bookmarksRes = await fetch(`${SQ_API_URL}/account/bookmarks`, {
        headers: fetchHeaders,
      });
      if (
        bookmarksRes.status === 403 &&
        (await bookmarksRes.text()) === "User is banned"
      ) {
        throw "banned";
      } else {
        const results = await bookmarksRes.json();
        return { props: { results } };
      }
    } catch (e) {
      if (e === "banned") throw "banned";
      return { props: { results: { torrents: [] } } };
    }
  }
);

export default Bookmarks;
