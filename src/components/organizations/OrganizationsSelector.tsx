import Image from 'next/image';
import { useRouter } from 'next/router';

import { Trans } from 'next-i18next';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

import { Organization } from '~/lib/organizations/types/organization';
import { useFetchUserOrganizations } from '~/lib/organizations/hooks/use-fetch-user-organizations';
import { useCurrentOrganization } from '~/lib/organizations/hooks/use-current-organization';

import If from '~/core/ui/If';
import CreateOrganizationModal from './CreateOrganizationModal';

import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectSeparator,
  SelectGroup,
  SelectAction,
  SelectLabel,
  SelectValue,
} from '~/core/ui/Select';

import ClientOnly from '~/core/ui/ClientOnly';

const OrganizationsSelector = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const organization = useCurrentOrganization();
  const path = router.asPath;
  const value = getDeepLinkPath(organization?.id as string, path);

  return (
    <>
      <Select
        value={value}
        onValueChange={(path) => {
          return router.replace(path);
        }}
      >
        <SelectTrigger
          data-cy={'organization-selector'}
          className={'!bg-transparent !h-9 w-full'}
        >
          <span
            className={
              'min-w-[5rem] block text-sm lg:max-w-[12rem] lg:text-base'
            }
          >
            <OrganizationItem organization={organization} />

            <span hidden>
              <SelectValue />
            </span>
          </span>
        </SelectTrigger>

        <SelectContent position={'popper'}>
          <SelectGroup>
            <SelectLabel>Your Customers</SelectLabel>

            <SelectSeparator />

            <ClientOnly>
              <OrganizationsOptions
                organization={organization}
                userId={userId}
              />
            </ClientOnly>
          </SelectGroup>

          <SelectSeparator />

          <SelectGroup>
            <CreateOrganizationModal
              onCreate={(organizationId) => {
                return router.replace(getDeepLinkPath(organizationId, path));
              }}
            >
              <SelectAction>
                <span
                  data-cy={'create-organization-button'}
                  className={'flex flex-row items-center space-x-2 truncate'}
                >
                  <PlusCircleIcon className={'h-5'} />

                  <span>
                    <Trans
                      i18nKey={'organization:createOrganizationDropdownLabel'}
                    />
                  </span>
                </span>
              </SelectAction>
            </CreateOrganizationModal>
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};

function OrganizationsOptions({
  userId,
  organization,
}: React.PropsWithChildren<{
  userId: string;
  organization: Maybe<WithId<Organization>>;
}>) {
  const router = useRouter();
  const { data, status } = useFetchUserOrganizations(userId);
  const path = router.asPath;
  const isLoading = status === 'loading';

  if (isLoading && organization) {
    const href = getDeepLinkPath(organization?.id as string, path);

    return (
      <SelectItem value={href} key={organization.id}>
        <OrganizationItem organization={organization} />
      </SelectItem>
    );
  }

  const organizations = data ?? [];

  return (
    <>
      {organizations.map((item) => {
        const href = getDeepLinkPath(item.id, path);

        return (
          <SelectItem value={href} key={item.id}>
            <OrganizationItem organization={item} />
          </SelectItem>
        );
      })}
    </>
  );
}

function OrganizationItem({
  organization,
}: {
  organization: Maybe<Organization>;
}) {
  const imageSize = 18;

  if (!organization) {
    return null;
  }

  const { logoURL, name } = organization;

  return (
    <span
      data-cy={'organization-selector-item'}
      className={`flex max-w-[12rem] items-center space-x-2`}
    >
      <If condition={logoURL}>
        <span className={'flex items-center'}>
          <Image
            style={{
              width: imageSize,
              height: imageSize,
            }}
            width={imageSize}
            height={imageSize}
            alt={`${name} Logo`}
            className={'object-contain'}
            src={logoURL as string}
          />
        </span>
      </If>

      <span className={'w-auto truncate text-sm font-medium'}>{name}</span>
    </span>
  );
}

function getDeepLinkPath(organizationId: string, path: string) {
  return ['', organizationId, path.slice(1, path.length)].join('/');
}

export default OrganizationsSelector;
