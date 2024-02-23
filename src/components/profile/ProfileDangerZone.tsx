import { Trans } from 'react-i18next';
import useSWRMutation from 'swr/mutation';

import Modal from '~/core/ui/Modal';
import Button from '~/core/ui/Button';
import Heading from '~/core/ui/Heading';

import { TextFieldInput, TextFieldLabel } from '~/core/ui/TextField';
import { useApiRequest } from '~/core/hooks/use-api';
import Alert from '~/core/ui/Alert';

export function ProfileDangerZone() {
  return <DeleteProfileContainer />;
}

function DeleteProfileContainer() {
  return (
    <div>
      <div className={'flex flex-col space-y-4'}>
        <div className={'flex flex-col space-y-1'}>
          <Heading type={5}>
            <Trans i18nKey={'profile:deleteAccount'} />
          </Heading>

          <p className={'text-gray-500'}>
            <Trans i18nKey={'profile:deleteAccountDescription'} />
          </p>
        </div>

        <Modal
          heading={<Trans i18nKey={'profile:deleteAccount'} />}
          Trigger={
            <div className={'flex flex-col space-y-2'}>
              <div>
                <Button
                  data-cy={'delete-account-button'}
                  variant={'destructive'}
                >
                  <Trans i18nKey={'profile:deleteAccount'} />
                </Button>
              </div>

              <p className={'text-sm text-gray-500 dark:text-gray-400'}>
                <Trans i18nKey={'profile:deleteAccountConfirmationHint'} />
              </p>
            </div>
          }
        >
          <DeleteProfileForm />
        </Modal>
      </div>
    </div>
  );
}

function DeleteProfileForm() {
  const deleteAccountMutation = useDeleteAccountMutation();

  if (deleteAccountMutation.error) {
    return (
      <Alert type={'error'}>
        <Alert.Heading>
          <Trans i18nKey={'profile:deleteAccountErrorHeading'} />
        </Alert.Heading>
        <Trans i18nKey={'common:genericError'} />
      </Alert>
    );
  }

  const onAccountDeleteRequested: React.FormEventHandler = (event) => {
    event.preventDefault();

    return deleteAccountMutation.trigger();
  };

  return (
    <form
      className={'flex flex-col space-y-4'}
      onSubmit={onAccountDeleteRequested}
    >
      <div className={'flex flex-col space-y-6'}>
        <div>
          <Trans i18nKey={'profile:deleteAccountDescription'} />
        </div>

        <TextFieldLabel>
          <Trans i18nKey={'profile:deleteProfileConfirmationInputLabel'} />

          <TextFieldInput
            data-cy={'delete-account-input-field'}
            required
            type={'text'}
            className={'w-full'}
            placeholder={''}
            pattern={`DELETE`}
          />
        </TextFieldLabel>

        <div>
          <Trans i18nKey={'common:modalConfirmationQuestion'} />
        </div>
      </div>

      <div className={'flex justify-end space-x-2.5'}>
        <Button
          data-cy={'confirm-delete-account-button'}
          loading={deleteAccountMutation.isMutating}
          variant={'destructive'}
        >
          <Trans i18nKey={'profile:deleteAccount'} />
        </Button>
      </div>
    </form>
  );
}

function useDeleteAccountMutation() {
  const fetcher = useApiRequest();

  return useSWRMutation(
    ['delete-account'],
    async () => {
      return fetcher({
        path: `/api/user`,
        method: 'DELETE',
      });
    },
    {
      onSuccess: () => {
        window.location.assign('/');
      },
    },
  );
}
