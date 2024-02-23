import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Trans } from 'next-i18next';

import CheckoutRedirectButton from '~/components/subscriptions/CheckoutRedirectButton';
import BillingPortalRedirectButton from '~/components/subscriptions/BillingRedirectButton';

import { Organization } from '~/lib/organizations/types/organization';

import { IfHasPermissions } from '~/components/IfHasPermissions';
import { canChangeBilling } from '~/lib/organizations/permissions';

import If from '~/core/ui/If';
import Alert from '~/core/ui/Alert';

import PricingTable from '~/components/PricingTable';

const EmbeddedStripeCheckout = dynamic(
  () => import('./EmbeddedStripeCheckout'),
  {
    ssr: false,
  },
);

const PlanSelectionForm: React.FCC<{
  organization: WithId<Organization>;
}> = ({ organization }) => {
  const customerId = organization.customerId;
  const [clientSecret, setClientSecret] = useState<string>();

  return (
    <div className={'flex flex-col space-y-6'}>
      <IfHasPermissions
        condition={canChangeBilling}
        fallback={<NoPermissionsAlert />}
      >
        <If condition={clientSecret}>
          <EmbeddedStripeCheckout clientSecret={clientSecret as string} />
        </If>

    
      </IfHasPermissions>
    </div>
  );
};

export default PlanSelectionForm;

function NoPermissionsAlert() {
  return (
    <Alert type={'warn'}>
      <Alert.Heading>
        <Trans i18nKey={'subscription:noPermissionsAlertHeading'} />
      </Alert.Heading>

      <Trans i18nKey={'subscription:noPermissionsAlertBody'} />
    </Alert>
  );
}
