import { apiClient } from './config';
import type { MemberListResponse, MemberListParams } from '../types/member';

export const memberAPI = {
  getMembers: async (params: MemberListParams = {}): Promise<MemberListResponse> => {
    const { pageSize = 50, lastPageIndex, role } = params;
    const queryParams = new URLSearchParams({
      pageSize: pageSize.toString()
    });

    if (lastPageIndex) {
      queryParams.append('lastPageIndex', lastPageIndex.toString());
    }

    if (role) {
      queryParams.append('role', role);
    }

    const response = await apiClient.get<MemberListResponse>(
      `/admins/members?${queryParams.toString()}`
    );
    return response.data;
  }
};