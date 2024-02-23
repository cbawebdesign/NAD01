import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';

import { withAppProps } from '~/lib/props/with-app-props';
import RouteShell from '~/components/RouteShell';

const DataviewPage = dynamic(
  () => import('~/components/dataview/dataview'),
  {
    ssr: false,
  }
);

const Search = () => {
  return (
    <RouteShell title={'Search'}>
      <DataviewPage/>
    </RouteShell>
  );
};

export default Search;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await withAppProps(ctx);
}
