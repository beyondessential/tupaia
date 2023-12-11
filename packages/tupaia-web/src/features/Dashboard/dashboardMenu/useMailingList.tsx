/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Dashboard, Entity } from "../../../types";

export const useMailingList = (activeDashboard?: Dashboard, activeEntityCode?: Entity['code']) => {

    if(!activeDashboard){
      return {}
    }
    const { mailingLists } = activeDashboard;

    if(!mailingLists) {
      return {}
    }

    const mailingList = mailingLists.find(({entityCode}) => entityCode === activeEntityCode)
    
    return { 
        hasMailingList: !!mailingList, 
        isSubscribed: mailingList?.isSubscribed 
    }
  }