import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';

import { withAppProps } from '~/lib/props/with-app-props';
import RouteShell from '~/components/RouteShell';

const NYStatePage = dynamic(
  () => import('~/components/NYState/NYState'),
  {
    ssr: false,
  }
);

const Search = () => {
    return (
      <RouteShell title={'Document Upload'}>
        <NYStatePage/>
      </RouteShell>
    );
  };

export default Search;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await withAppProps(ctx);
}
