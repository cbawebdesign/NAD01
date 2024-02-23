import { getAuth, UserRecord } from 'firebase-admin/auth';

import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import {
  ChevronRightIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';

import { withAdminProps } from '~/lib/admin/props/with-admin-props';
import { getOrganizationsForUser } from '~/lib/admin/queries';
import { Organization } from '~/lib/organizations/types/organization';
import { MembershipRole } from '~/lib/organizations/types/membership-role';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/core/ui/Table';

import Heading from '~/core/ui/Heading';
import Tile from '~/core/ui/Tile';
import Label from '~/core/ui/Label';
import Badge from '~/core/ui/Badge';
import TextField from '~/core/ui/TextField';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/core/ui/Dropdown';

import Button from '~/core/ui/Button';
import If from '~/core/ui/If';

import AdminRouteShell from '~/components/admin/AdminRouteShell';
import AdminHeader from '~/components/admin/AdminHeader';
import DisableUserModal from '~/components/admin/users/DisableUserModal';
import ImpersonateUserModal from '~/components/admin/users/ImpersonateUserModal';
import ReactivateUserModal from '~/components/admin/users/ReactivateUserModal';
import RoleBadge from '~/components/organizations/RoleBadge';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface SearchResult {
  union: string;
  uid: string; // Add the 'uid' property
  id:string;
  spouse: string;
  startdate: string;
  LastName: string;
  FirstName: string;
  LM: string;
  CurrentTotalPremium: string;
  CaseNotes:string;
  Status:string;
  MarkifBW:string;
  PreviousTotalPremium:string;
  MM:string;
  Files: {
    title: string;
    date: string;
    url: string;
  }[];
  ChangeDate:string;
  current_deduction:string;
  premium_date: {
    date: string;
    premium: number;
  }[];
  // Add other properties if necessary
}


function UserAdminPage({
  user,
  organizations,
  unionData, // Access unionData from props
}: React.PropsWithChildren<{
  user: UserRecord & {
    isDisabled: boolean;
    isActive: boolean;
    union:string;
  };
  organizations: Array<
    WithId<
      Organization & {
        role: MembershipRole;
      }
    >
  >;
  unionData: any; // Define the type according to the structure of your data
}>) {
  const [file, setFile] = useState<File | null>(null);
  const displayName =
    user.displayName || user.email || user.phoneNumber || user.uid || '';
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [unionFilter, setUnionFilter] = useState('');
    const router = useRouter();
    const [formFields, setFormFields] = useState({});
    const [unionInput, setUnionInput] = useState('');
    const [CaseNotesInput, setCaseNotesInput] = useState('');
    const [CurrentTotalPremiumInput, setCurrentTotalPremiumInput] = useState('');
    const [LMInput, setLMInput] = useState('');
    const [MMInput, setMMInput] = useState('');
    const [ChangeDateInput, setChangeDateInput] = useState('');
    const [MarkifBWInput, setMarkifBWInput] = useState('');
    const [PreviousTotalPremiumInput, setPreviousTotalPremiumInput] = useState('');
    const [StatusInput, setStatusInput] = useState('');
    const [FirstNameInput, setFirstNameInput] = useState('');
    const [spouseInput, setSpouseInput] = useState('');
    const [startDateInput, setStartDateInput] = useState('');
    const [LastNameInput, setLastNameInput] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
      const fetchUsers = async () => {
        const requestBody = {
          query,
          active: activeFilter,
          union: unionFilter,
          userId: user.uid, // Include the user's UID in the request
        };
        console.log("Search Request Body:", requestBody);
        console.log(searchResults.map(result => result.Files));
        try {
          const response = await fetch('/api/search/search', { // Update the API endpoint
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
    
          if (response.ok) {
            const users = await response.json();
            console.log('API response:', users); // Log the API response

            setSearchResults(users);
            console.log('Search results:', users); // Log the search results

          } else {
            console.error('Search failed');
          }
        } catch (error) {
          console.error('An error occurred during the search:', error);
        }
      };
    
      fetchUsers();
    }, [query, activeFilter, unionFilter, user]);
    useEffect(() => {
      console.log('User UID:', user.uid); // Log the user UID


      const currentUser = searchResults.find(result => result.id === user.uid);
      console.log('Current user:', currentUser); // Log the current user

      if (currentUser) {
        setUnionInput(currentUser.union);
        setCaseNotesInput(currentUser.CaseNotes);
        setCurrentTotalPremiumInput(currentUser.CurrentTotalPremium);
        setSpouseInput(currentUser.spouse);
        setStartDateInput(currentUser.startdate);
        setLastNameInput(currentUser.LastName);
        setLMInput(currentUser.spouse);
        setMMInput(currentUser.MM);
        setChangeDateInput(currentUser.ChangeDate);
        setMarkifBWInput(currentUser.MarkifBW);
        setPreviousTotalPremiumInput(currentUser.PreviousTotalPremium);
        setStatusInput(currentUser.Status);
        setFirstNameInput(currentUser.FirstName);

      }
    }, [searchResults, user.uid]);
    const updateUser = async (Status: string, uid: string,CaseNotes:string, LM:string,CurrentTotalPremium:string,union: string, spouse: string, startDate: string, LastName: string) => {
      try {
        const requestBody = {
          union: union,
          CaseNotes: CaseNotes,
          spouse: spouse,
          startdate: startDate,
          LastName: LastName,
          CurrentTotalPremium: CurrentTotalPremium,
          LM:LM,
          Status: Status,
          uid: uid,
          

        };
        console.log('Updating user with ID:', user.uid);

        const response = await fetch(`/api/update-user/${user.uid}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
  
        if (response.ok) {
          setSuccessMessage('User updated successfully!');
                } else {
          console.error('Update failed');
        }
      } catch (error) {
        console.error('An error occurred while updating the user:', error);
      }
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setFile(e.target.files[0]);
      }
    };
    const handleUpload = async () => {
      if (file) {
        const storage = getStorage();
        const storageRef = ref(storage, 'userdocuments/' + file.name);
    
        const uploadTask = uploadBytesResumable(storageRef, file);
    
        uploadTask.on('state_changed', 
          (snapshot) => {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            setUploadProgress(progress); // Update the progress state
          }, 
          (error) => {
            console.log(error);
          }, 
          async () => {
            getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
              console.log('File available at', downloadURL);
    
              // Make a request to your API to update the user document
              const response = await fetch('/api/setdocument/setdocument', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  uid: user.uid,
                  avatarURL: downloadURL,
                  fileName: file.name,
                }),
              });
    
              const data = await response.json();
              console.log(data);
              setUploadSuccess(true); // Set the upload success state to true
            });
          }
        );
      }
    };
  return (
    <AdminRouteShell>
      <Head>
        <title>{`Manage User | ${displayName}`}</title>
      </Head>

      <AdminHeader>Manage User</AdminHeader>

      <div className={'p-3 flex flex-col flex-1'}>
        <div className={'flex flex-col space-y-6'}>
          <div className={'flex justify-between'}>
            <Breadcrumbs displayName={displayName} />

            <div>
              <UserActionsDropdown
                uid={user.uid}
                isDisabled={user.disabled}
                displayName={displayName}
              />
            </div>
          </div>

          <Tile>
            <Heading type={4}>User Details</Heading>

            <div className={'flex space-x-2 items-center'}>
              <div>
                <Label>Status</Label>
              </div>

              <div className={'inline-flex'}>
                {user.isActive ? (
                  <Badge size={'small'} color={'error'}>
                    Disabled
                  </Badge>
                ) : (
                  <Badge size={'small'} color={'success'}>
                    Active
                  </Badge>
                )}
              </div>
            </div>

            <TextField.Label>
              Display name
              <TextField.Input
                className={'max-w-sm'}
                defaultValue={user.displayName ?? ''}
                
              />
            </TextField.Label>

           
  
            <div className="space-y-4 max-w-md mx-auto">
  <input type="file" onChange={handleFileChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
  <button onClick={handleUpload} className="w-full px-3 py-2 bg-blue-500 text-white rounded-md">Upload</button>
  <div className="relative pt-1">
    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
      <div style={{ width: `${uploadProgress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
    </div>
  </div>
  {uploadSuccess && <p className="text-green-500">Upload successful!</p>}
</div>


            <TextField.Label>
              Phone number
              <TextField.Input
                className={'max-w-sm'}
                defaultValue={user.phoneNumber ?? ''}
                disabled
              />
            </TextField.Label>

{searchResults.map((searchResult) => {
  if (searchResult.id === user.uid) {
    return (
      <form 
      key={searchResult.id} 
      onSubmit={(e) => { 
        e.preventDefault(); 
        updateUser(StatusInput,searchResult.id,CaseNotesInput, CurrentTotalPremiumInput, LMInput, unionInput, spouseInput, startDateInput, LastNameInput); 
      }}
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}
    >
      <div style={{ width: '30%' }}>
      <TextField.Label>
          First Name
          <TextField.Input
            className={'max-w-sm'}
            value={FirstNameInput}
            onChange={(e) => setFirstNameInput((e.target as HTMLInputElement).value)}
          />
        </TextField.Label>
     
        <TextField.Label>
          Spouse
          <TextField.Input
            className={'max-w-sm'}
            value={spouseInput}
            onChange={(e) => setSpouseInput((e.target as HTMLInputElement).value)}
          />
        </TextField.Label>
        <TextField.Label>
          Union
          <TextField.Input
            className={'max-w-sm'}
            value={unionInput}
            onChange={(e) => setUnionInput((e.target as HTMLInputElement).value)}
          />
        </TextField.Label>
        <TextField.Label>
          Change Date
          <TextField.Input
            className={'max-w-sm'}
            value={ChangeDateInput}
            onChange={(e) => setChangeDateInput((e.target as HTMLInputElement).value)}
          />
        </TextField.Label>
        <TextField.Label>
          MarkifBW
          <TextField.Input
            className={'max-w-sm'}
            value={MarkifBWInput}
            onChange={(e) => setMarkifBWInput((e.target as HTMLInputElement).value)}
          />
        </TextField.Label>
      </div>
      <div style={{ width: '30%' }}>
       
        <TextField.Label>
          Last Name
          <TextField.Input
            className={'max-w-sm'}
            value={LastNameInput}
            onChange={(e) => setLastNameInput((e.target as HTMLInputElement).value)}
          />
        </TextField.Label>
        <TextField.Label>
          Start Date
          <TextField.Input
            className={'max-w-sm'}
            value={startDateInput}
            onChange={(e) => setStartDateInput((e.target as HTMLInputElement).value)}
          />
        </TextField.Label>
        <TextField.Label>
          LM
          <TextField.Input
            className={'max-w-sm'}
            value={LMInput}
            onChange={(e) => setLMInput((e.target as HTMLInputElement).value)}
          />
        </TextField.Label>
        <TextField.Label>
          MM
          <TextField.Input
            className={'max-w-sm'}
            value={MMInput}
            onChange={(e) => setMMInput((e.target as HTMLInputElement).value)}
          />
        </TextField.Label>
        

  {/* ... other TextField.Labels ... */}

      </div>
     
      <div style={{ width: '30%', marginBottom: '20px' }}>
        <TextField.Label>
          Case Notes
          <TextField.Input
            className={'max-w-sm'}
            value={CaseNotesInput}
            onChange={(e) => setCaseNotesInput((e.target as HTMLInputElement).value)}
          />
        </TextField.Label>
        <TextField.Label>
          Current Total Premium
          <TextField.Input
            className={'max-w-sm'}
            value={CurrentTotalPremiumInput}
            onChange={(e) => setCurrentTotalPremiumInput((e.target as HTMLInputElement).value)}
          />
        </TextField.Label>
        <TextField.Label>
          Previous Total Premium
          <TextField.Input
            className={'max-w-sm'}
            value={PreviousTotalPremiumInput}
            onChange={(e) => setPreviousTotalPremiumInput((e.target as HTMLInputElement).value)}
          />
        </TextField.Label>
        <TextField.Label>
  Status
  <div className="relative inline-block w-full text-gray-700 w-64"> {/* Adjust the width here */}
    <select
      className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline"
      value={StatusInput}
      onChange={(e) => setStatusInput((e.target as HTMLSelectElement).value)}
    >
      <option value="Termed">Termed</option>
      <option value="Retired">Retired</option>
      <option value="On Leave">On Leave</option>
      <option value="Military Leave">Military Leave</option>
      <option value="Not Eligible">Not Eligible</option>
      <option value="Suspended">Suspended</option>
      <option value="Cancelled">Cancelled</option>
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
        <path d="M7 7a1 1 0 011.707-.707l3.586 3.586a1 1 0 01-1.414 1.414l-3.586-3.586A1 1 0 017 7z" />
        <path d="M7 13a1 1 0 011.707-.707l3.586 3.586a1 1 0 11-1.414 1.414l-3.586-3.586A1 1 0 017 13z" />
      </svg>
    </div>
  </div>
</TextField.Label>
        <TextField.Label>
  Current NY Deduction
  <TextField.Input
    className={'max-w-sm'}
    value={searchResult.current_deduction}
    readOnly
  />
</TextField.Label>
        
      </div>
      <br></br>
      <br></br>
      <div className="w-full lg:w-64">
  <h2 className="text-2xl font-bold mb-4">Premium History</h2>
  {searchResult.premium_date.slice(0, showAll ? searchResult.premium_date.length : 1).map((premiumDate, index) => (
    <div key={index} className="mb-5 w-full">
      <TextField.Label>
        <TextField.Input
          className={'w-full'}
          value={`Date: ${premiumDate.date}, Premium: ${premiumDate.premium}`}
          readOnly
        />
      </TextField.Label>
    </div>
  ))}
  {searchResult.premium_date.length > 1 && (
    <button onClick={() => setShowAll(!showAll)}>
      {showAll ? 'Show Less' : 'Show More'}
    </button>
  )}
</div>
<hr className="my-8" />
<div className="w-full lg:w-2/3">
  <h2 className="text-2xl font-bold mb-4">Uploaded Files</h2>
  {searchResults.map((searchResult) => {
    if (searchResult.id === user.uid) {
      return (
        <form 
        key={searchResult.id} 
        onSubmit={async (e) => { 
          e.preventDefault(); 
          await updateUser(
            StatusInput,
            user.uid,
            CaseNotesInput,
            LMInput,
            CurrentTotalPremiumInput,
            unionInput,
            spouseInput,
            startDateInput,
            LastNameInput
          );
        }}
        className="space-y-4"
      >
          {searchResult.Files.map((file, index) => (
            <div key={index} className="border p-4 rounded-md space-y-2 max-w-lg">
              <label className="block">
                <span className="text-gray-700">Title:</span>
                <input type="text" value={file.title} readOnly className="mt-1 block w-full rounded-md border-gray-300" />
              </label>
              <label className="block">
                <span className="text-gray-700">Date:</span>
                <input type="text" value={file.date} readOnly className="mt-1 block w-full rounded-md border-gray-300" />
              </label>
              <label className="block">
                <span className="text-gray-700">URL:</span>
                <a href={file.url} download className="mt-1 inline-block px-4 py-2 bg-blue-500 text-white rounded-md">Download File</a>
              </label>
            </div>
          ))}
          {/* rest of your form fields... */}
        </form>
      );
    }
  })}
</div>

<div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
    <Button style={{ marginTop: '20px', width: 'auto' }} type="submit">Update User</Button>
  </div>
</form>
    );
  }
  return null;
})}

{successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}


          </Tile>
       
         
        </div>
      </div>
    </AdminRouteShell>
  );
}


export default UserAdminPage;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const adminProps = await withAdminProps(ctx);

  if ('redirect' in adminProps) {
    return adminProps;
  }

  const auth = getAuth();
  const user = await auth.getUser(ctx.query.id as string);

  const userProps = {
    uid: user.uid,
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    disabled: user.disabled,

  };

  const organizations = await getOrganizationsForUser(user.uid);

  return {
    props: {
      ...adminProps.props,
      organizations,
      user: userProps,

    },
  };
}

function Breadcrumbs({
  displayName,
}: React.PropsWithChildren<{
  displayName: string;
}>) {
  return (
    <div className={'flex space-x-1 items-center text-xs p-2'}>
      <Link href={'/admin'}>Admin</Link>
      <ChevronRightIcon className={'w-3'} />
      <Link href={'/admin/users'}>Users</Link>
      <ChevronRightIcon className={'w-3'} />
      <span>{displayName}</span>
    </div>
  );
}

function UserActionsDropdown({
  uid,
  displayName,
  isDisabled,
}: React.PropsWithChildren<{
  uid: string;
  isDisabled: boolean;
  displayName: string;
}>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'ghost'}>
          <span className={'flex space-x-2.5 items-center'}>
            <span>Manage User</span>

            <EllipsisVerticalIcon className={'w-4'} />
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <ImpersonateUserModal userId={uid} displayName={displayName}>
            Impersonate
          </ImpersonateUserModal>
        </DropdownMenuItem>

        <If condition={!isDisabled}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <DisableUserModal userId={uid} displayName={displayName}>
              <span className={'text-red-500'}>Disable</span>
            </DisableUserModal>
          </DropdownMenuItem>
        </If>

        <If condition={isDisabled}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <ReactivateUserModal userId={uid} displayName={displayName}>
              Reactivate
            </ReactivateUserModal>
          </DropdownMenuItem>
        </If>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}