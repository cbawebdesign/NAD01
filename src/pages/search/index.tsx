import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';

import { withAppProps } from '~/lib/props/with-app-props';
import RouteShell from '~/components/RouteShell';

const SearchPage = dynamic(
  () => import('~/components/search/search'),
  {
    ssr: false,
  }
);

const Search = () => {
  return (
    <RouteShell title={'Search'}>
      <SearchPage/>
    </RouteShell>
  );
};

export default Search;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await withAppProps(ctx);
}
