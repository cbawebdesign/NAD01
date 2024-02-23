import Tile from '~/core/ui/Tile';

interface Data {
  usersCount: number;
  organizationsCount: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  cobacount:number;
}

function AdminDashboard({
  data,
}: React.PropsWithChildren<{
  data: Data;
}>) {
  return (
    <div
      data-cy={'admin-dashboard'}
      className={
        'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3' +
        ' xl:grid-cols-4'
      }
    >
      <Tile>
        <Tile.Heading>Users</Tile.Heading>

        <Tile.Body>
          <div className={'flex justify-between'}>
            <Tile.Figure>{data.usersCount}</Tile.Figure>
          </div>
        </Tile.Body>
      </Tile>


      <Tile>
        <Tile.Heading>Active Customers</Tile.Heading>

        <Tile.Body>
          <div className={'flex justify-between'}>
            <Tile.Figure>{data.activeSubscriptions}</Tile.Figure>
          </div>
        </Tile.Body>
      </Tile>

      <Tile>
        <Tile.Heading>Inactive</Tile.Heading>

        <Tile.Body>
          <div className={'flex justify-between'}>
            <Tile.Figure>{data.trialSubscriptions}</Tile.Figure>
          </div>
        </Tile.Body>
      </Tile>
      <Tile>
        <Tile.Heading>L831 Members</Tile.Heading>

        <Tile.Body>
          <div className={'flex justify-between'}>
            <Tile.Figure>{data.organizationsCount}</Tile.Figure>
          </div>
        </Tile.Body>
      </Tile>
      <Tile>
        <Tile.Heading>COBA Members</Tile.Heading>

        <Tile.Body>
          <div className={'flex justify-between'}>
            <Tile.Figure>{data.cobacount}</Tile.Figure>
          </div>
        </Tile.Body>
      </Tile>
    </div>
  );
}

export default AdminDashboard;
