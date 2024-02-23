import { FirestoreOrganizationMembership } from './organization-membership';
import { OrganizationSubscription } from './organization-subscription';

type UserId = string;

interface BaseOrganization {
  name: string;
  lastName: string;
  spouse:string;
  dependants:string;
  contactnumber:string;
  email: string;
  timezone?: string;
  logoURL?: string | null;
  subscription?: OrganizationSubscription;
  customerId?: string;
  serviceMember: boolean; // Added field

}

export interface Organization extends BaseOrganization {
  members: Record<UserId, FirestoreOrganizationMembership>;
}
