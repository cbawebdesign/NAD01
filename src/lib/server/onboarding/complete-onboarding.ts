import { getAuth } from 'firebase-admin/auth';

import { MembershipRole } from '~/lib/organizations/types/membership-role';

import { getOrganizationsCollection, getUsersCollection } from '../collections';
import getRestFirestore from '~/core/firebase/admin/get-rest-firestore';
import { StringNullableChain } from 'cypress/types/lodash';

interface Params {
  organizationName: string;
  organizationlastName: string;
  organizationemail: string;
  userId: string;
  organizationcontactnumber: string;
  organizationspouse: string;
  organizationdependants: string;
  organizationserviceMember: boolean;
}

/**
 * @name completeOnboarding
 * @description Handles the submission of the onboarding flow. By default,
 * we use the submission to create the Organization and the user record
 * associated with the User who signed up using its ID
 * @param userId
 * @param organizationName
 * @param organizationlastName
 * @param organizationcontactnumber
 * @param organizationspouse
 * @param organizationdependants
 * @param organizationserviceMember

 */
export async function completeOnboarding({ userId, organizationserviceMember, organizationName,organizationemail, organizationlastName, organizationcontactnumber, organizationdependants, organizationspouse }: Params) {
  const firestore = getRestFirestore();
  const auth = getAuth();

  const batch = firestore.batch();

  const organizationRef = getOrganizationsCollection().doc();
  const userRef = getUsersCollection().doc(userId);

  const organizationMembers = {
    [userId]: {
      user: userRef,
      role: MembershipRole.Owner,
    },
  };

  // create organization
  batch.create(organizationRef, {
    name: organizationName,
    lastName: organizationlastName,
    members: organizationMembers,
    email: organizationemail,
    spouse: organizationspouse,
    contactnumber: organizationcontactnumber,
    dependants: organizationdependants,
    serviceMember: organizationserviceMember
  });

  // Here we create the user's Firestore record
  // You can add any additional properties to the user object
  batch.set(userRef, {});

  await batch.commit();

  // we can set the user as "onboarded" using the custom claims
  // it helps with not having to query Firestore for each request
  await auth.setCustomUserClaims(userId, {
    onboarded: true,
  });
}
