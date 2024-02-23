import React, { FormEvent, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Trans, useTranslation } from 'next-i18next';

import Modal from '~/core/ui/Modal';
import TextField from '~/core/ui/TextField';
import Button from '~/core/ui/Button';

import { useCreateOrganization } from '~/lib/organizations/hooks/use-create-organization';

const CreateOrganizationModal: React.FC<{
  onCreate: (organizationId: string) => void;
  children?: React.ReactNode;
}> = ({ onCreate, children }) => {
  const [createOrganization, createOrganizationState] = useCreateOrganization();
  const { loading } = createOrganizationState;
  const { t } = useTranslation();

  const [isServiceMember, setIsServiceMember] = useState(false); // State for the Service Member checkbox

  const Heading = useMemo(
    () => <Trans i18nKey={'organization:createOrganizationModalHeading'} />,
    [],
  );

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const data = new FormData(event.currentTarget);
      const email = data.get('email') as string;
      const spouse = data.get('spouse') as string;
      const contactnumber = data.get('contactnumber') as string;
      const dependants = data.get('dependants') as string;
      const name = data.get('name') as string;
      const lastName = data.get('lastName') as string;

      const isNameInvalid = !name || name.trim().length <= 1;
      const isLastNameInvalid = !lastName || lastName.trim().length <= 1;
      const isEmailInvalid = !email || email.trim().length <= 1;

      if (isNameInvalid || isLastNameInvalid || isEmailInvalid) {
        return toast.error(`Please use valid names`);
      }

      const promise = createOrganization(name, isServiceMember, lastName, email, contactnumber, spouse, dependants).then((organizationId) => {
        if (organizationId) {
          onCreate(organizationId);
        }
      });

      toast.promise(promise, {
        success: t(`organization:createOrganizationSuccess`),
        error: t(`organization:createOrganizationError`),
        loading: t(`organization:createOrganizationLoading`),
      });
    },
    [createOrganization, onCreate, t, isServiceMember],
  );

  return (
    <Modal Trigger={children} heading={Heading}>
      <form onSubmit={onSubmit}>
        <div className={'flex flex-col space-y-6'}>
          <TextField.Label>
            <Trans i18nKey={'organization:organizationNameLabel'} />
            <TextField.Input
              data-cy={'create-organization-name-input'}
              name={'name'}
              required
              placeholder={''}
            />
          </TextField.Label>

          <TextField.Label>
            <Trans i18nKey={'organization:organizationLastNameLabel'} />
            <TextField.Input
              data-cy={'create-organization-last-name-input'}
              name={'lastName'}
              required
              placeholder={''}
            />
          </TextField.Label>

          <TextField.Label>
            <Trans i18nKey={'organization:organizationemailLabel'} />
            <TextField.Input
              data-cy={'create-organization-email-input'}
              name={'email'}
              required
              placeholder={''}
            />
          </TextField.Label>

          <TextField.Label>
            <Trans i18nKey={'organization:organizationcontactnumberLabel'} />
            <TextField.Input
              data-cy={'create-organization-contactnumber-input'}
              name={'contactnumber'}
              required
              placeholder={''}
            />
          </TextField.Label>

          <TextField.Label>
            <Trans i18nKey={'organization:organizationspouseLabel'} />
            <TextField.Input
              data-cy={'create-organization-spouse-input'}
              name={'spouse'}
              required
              placeholder={''}
            />
          </TextField.Label>

          <TextField.Label>
            <Trans i18nKey={'organization:organizationdependantLabel'} />
            <TextField.Input
              data-cy={'create-organization-dependants-input'}
              name={'dependants'}
              required
              placeholder={''}
            />
          </TextField.Label>

          <TextField.Label>
            <Trans i18nKey={'organization:organizationserviceMemberLabel'} />
            <input
              type="checkbox"
              name={'serviceMember'}
              checked={isServiceMember}
              onChange={(e) => setIsServiceMember(e.target.checked)}
            />
          </TextField.Label>

          <div className={'flex justify-end space-x-2'}>
            <Button
              data-cy={'confirm-create-organization-button'}
              loading={loading}
            >
              <Trans i18nKey={'organization:createOrganizationSubmitLabel'} />
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateOrganizationModal;
