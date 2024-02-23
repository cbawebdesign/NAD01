import { Line, ResponsiveContainer, LineChart, XAxis } from 'recharts';
import { useMemo } from 'react';

import Tile from '~/core/ui/Tile';
import Heading from '~/core/ui/Heading';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/core/ui/Table';

import { useUserSession } from '~/core/hooks/use-user-session';
import { Title } from '@radix-ui/react-dialog';

export default function DashboardDemo() {
  const mrr = useMemo(() => generateDemoData(), []);
  const visitors = useMemo(() => generateDemoData(), []);
  const returningVisitors = useMemo(() => generateDemoData(), []);
  const churn = useMemo(() => generateDemoData(), []);
  const netRevenue = useMemo(() => generateDemoData(), []);
  const fees = useMemo(() => generateDemoData(), []);
  const newCustomers = useMemo(() => generateDemoData(), []);
  const tickets = useMemo(() => generateDemoData(), []);
  const activeUsers = useMemo(() => generateDemoData(), []);

  return (
    <div className={'flex flex-col space-y-6 pb-36'}>
      <UserGreetings />
      <p>IN DEVELOPMENT-DRAFT</p>

      <div
        className={
          'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3' +
          ' xl:grid-cols-4'
        }
      >
        <Tile>
          <Tile.Heading>New Customers</Tile.Heading>

          <Tile.Body>
            <div className={'flex justify-between'}>
              <Tile.Figure>{`$${mrr[1]}`}</Tile.Figure>
              <Tile.Trend trend={'up'}>0%</Tile.Trend>
            </div>

            <Chart data={mrr[0]} />
          </Tile.Body>
        </Tile>

        <Tile>
          <Tile.Heading>Existing Customers</Tile.Heading>

          <Tile.Body>
            <div className={'flex justify-between'}>
              <Tile.Figure>{`$${netRevenue[1]}`}</Tile.Figure>
              <Tile.Trend trend={'up'}>12%</Tile.Trend>
            </div>

            <Chart data={netRevenue[0]} />
          </Tile.Body>
        </Tile>

        <Tile>
          <Tile.Heading>Outgoing Files</Tile.Heading>

          <Tile.Body>
            <div className={'flex justify-between'}>
              <Tile.Figure>{`$${fees[1]}`}</Tile.Figure>
              <Tile.Trend trend={'up'}>9%</Tile.Trend>
            </div>

            <Chart data={fees[0]} />
          </Tile.Body>
        </Tile>

        <Tile>
          <Tile.Heading>Incoming Files</Tile.Heading>

          <Tile.Body>
            <div className={'flex justify-between'}>
              <Tile.Figure>{`${newCustomers[1]}`}</Tile.Figure>
              <Tile.Trend trend={'down'}>-25%</Tile.Trend>
            </div>

            <Chart data={newCustomers[0]} />
          </Tile.Body>
        </Tile>

        <Tile>
          <Tile.Heading>Placeholder</Tile.Heading>

          <Tile.Body>
            <div className={'flex justify-between'}>
              <Tile.Figure>{visitors[1]}</Tile.Figure>
              <Tile.Trend trend={'down'}>-4.3%</Tile.Trend>
            </div>

            <Chart data={visitors[0]} />
          </Tile.Body>
        </Tile>

        <Tile>
          <Tile.Heading>Placeholder</Tile.Heading>

          <Tile.Body>
            <div className={'flex justify-between'}>
              <Tile.Figure>{returningVisitors[1]}</Tile.Figure>
              <Tile.Trend trend={'stale'}>10%</Tile.Trend>
            </div>

            <Chart data={returningVisitors[0]} />
          </Tile.Body>
        </Tile>

        <Tile>
          <Tile.Heading>Placeholder</Tile.Heading>

          <Tile.Body>
            <div className={'flex justify-between'}>
              <Tile.Figure>{churn[1]}%</Tile.Figure>
              <Tile.Trend trend={'up'}>-10%</Tile.Trend>
            </div>

            <Chart data={churn[0]} />
          </Tile.Body>
        </Tile>

        <Tile>
          <Tile.Heading>Placeholder</Tile.Heading>

          <Tile.Body>
            <div className={'flex justify-between'}>
              <Tile.Figure>{tickets[1]}</Tile.Figure>
              <Tile.Trend trend={'up'}>-30%</Tile.Trend>
            </div>

            <Chart data={tickets[0]} />
          </Tile.Body>
        </Tile>
      </div>

      <div>
        <Tile>
          <Tile.Heading>Placeholder</Tile.Heading>

          <Tile.Body>
            <div className={'flex justify-between'}>
              <Tile.Figure>{activeUsers[1]}</Tile.Figure>
              <Tile.Trend trend={'up'}>10%</Tile.Trend>
            </div>

            <Chart data={activeUsers[0]} />
          </Tile.Body>
        </Tile>
      </div>

      <div>
        <Tile>
          <Tile.Heading>Placeholder</Tile.Heading>

          <Tile.Body>
            <CustomersTable></CustomersTable>
          </Tile.Body>
        </Tile>
      </div>
    </div>
  );
}

function UserGreetings() {
  const user = useUserSession();
  const userDisplayName = user?.auth?.displayName ?? user?.auth?.email ?? '';

  return (
    <div>
      <Heading type={4}>Welcome Back, {userDisplayName}</Heading>

      <p className={'text-gray-500 dark:text-gray-400'}>
        <span>Here&apos;s what is happening across your business</span>
      </p>
    </div>
  );
}

function generateDemoData() {
  const today = new Date();

  const formatter = new Intl.DateTimeFormat('en-us', {
    month: 'long',
    year: '2-digit',
  });

  const data: { value: string; name: string }[] = [];

  for (let n = 8; n > 0; n -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - n, 1);

    data.push({
      name: formatter.format(date) as string,
      value: (Math.random() * 10).toFixed(1),
    });
  }

  return [data, data[data.length - 1].value] as [typeof data, string];
}

function Chart(
  props: React.PropsWithChildren<{ data: { value: string; name: string }[] }>,
) {
  return (
    <div className={'h-36'}>
      <ResponsiveContainer width={'100%'} height={'100%'}>
        <LineChart data={props.data}>
          <Line
            className={'text-primary'}
            type="monotone"
            dataKey="value"
            stroke="currentColor"
            strokeWidth={2.5}
            dot={false}
          />

          <XAxis
            style={{ fontSize: 9 }}
            axisLine={false}
            tickSize={0}
            dataKey="name"
            height={15}
            dy={10}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomersTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Placeholder</TableHead>
          <TableHead>Placeholder</TableHead>
          <TableHead>Placeholder</TableHead>
          <TableHead>Placeholder</TableHead>
          <TableHead>Placeholder</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow>
          <TableCell>Placeholder</TableCell>
          <TableCell>Placeholder</TableCell>
          <TableCell>Placeholder</TableCell>
          <TableCell>Placeholder</TableCell>
          <TableCell>
            <Tile.Badge trend={'up'}>Placeholder</Tile.Badge>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>Placeholder</TableCell>
          <TableCell>Placeholder</TableCell>
          <TableCell>Placeholder</TableCell>
          <TableCell>Placeholder</TableCell>
          <TableCell>
            <Tile.Badge trend={'stale'}>Placeholder</Tile.Badge>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>Placeholder</TableCell>
          <TableCell>Placeholder</TableCell>
          <TableCell>Placeholder</TableCell>
          <TableCell></TableCell>
          <TableCell>
            <Tile.Badge trend={'up'}>Placeholder</Tile.Badge>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>Placeholder</TableCell>
          <TableCell>Placeholder</TableCell>
          <TableCell>Placeholder</TableCell>
          <TableCell>Placeholder</TableCell>
          <TableCell>
            <Tile.Badge trend={'down'}>Placeholder</Tile.Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
