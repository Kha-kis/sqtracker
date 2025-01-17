import React from "react";
import { useRouter } from "next/router";
import getConfig from "next/config";
import qs from "qs";
import slugify from "slugify";
import { withAuthServerSideProps } from "../../utils/withAuth";
import SEO from "../../components/SEO";
import Text from "../../components/Text";
import TorrentList from "../../components/TorrentList";

const Category = ({ results }) => {
  const router = useRouter();
  const {
    query: { category: categorySlug },
  } = router;

  const {
    publicRuntimeConfig: { SQ_TORRENT_CATEGORIES },
  } = getConfig();

  const category = Object.keys(SQ_TORRENT_CATEGORIES).find(
    (c) => slugify(c, { lower: true }) === categorySlug
  );

  return (
    <>
      <SEO title={`Browse ${category}`} />
      <Text as="h1" mb={5}>
        Browse {category}
      </Text>
      {results?.torrents.length ? (
        <TorrentList
          torrents={results.torrents}
          categories={SQ_TORRENT_CATEGORIES}
          total={results.total}
        />
      ) : (
        <Text color="grey">No results.</Text>
      )}
    </>
  );
};

export const getServerSideProps = withAuthServerSideProps(
  async ({
    token,
    fetchHeaders,
    query: { category, source, page: pageParam },
  }) => {
    if (!token) return { props: {} };

    const {
      publicRuntimeConfig: { SQ_API_URL },
    } = getConfig();

    const params = {
      category: encodeURIComponent(category),
      source: source ? encodeURIComponent(source) : undefined,
    };
    const page = pageParam ? parseInt(pageParam) : 0;
    if (page > 0) params.page = page;

    try {
      const searchRes = await fetch(
        `${SQ_API_URL}/torrent/search?${qs.stringify(params)}`,
        {
          headers: fetchHeaders,
        }
      );
      if (
        searchRes.status === 403 &&
        (await searchRes.text()) === "User is banned"
      ) {
        throw "banned";
      }
      const results = await searchRes.json();
      return { props: { results } };
    } catch (e) {
      if (e === "banned") throw "banned";
      return { props: {} };
    }
  }
);

export default Category;
