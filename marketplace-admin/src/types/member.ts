export type MemberRole = 'ROLE_USER' | 'ROLE_ADMIN';

export type Member = {
  studentId: number;
  cheerTicket: number;
  account: string;
  accountNumber: string;
  role: MemberRole;
  fcmToken: string;
  createdAt: string;
  modifiedAt: string;
};

export type MemberListResponse = {
  message: string;
  response: {
    members: Member[];
    hasNext: boolean;
  };
};

export type MemberListParams = {
  lastPageIndex?: number;
  pageSize?: number;
  role?: MemberRole;
};

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  ROLE_USER: '일반 사용자',
  ROLE_ADMIN: '관리자'
};