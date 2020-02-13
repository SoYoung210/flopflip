import React from 'react';
import {
  TAdapter,
  TFlags,
  TAdapterStatus,
  TFlagsChange,
  TAdapterStatusChange,
  TConfigureAdapterChildren,
  TConfigureAdapterProps,
  TAdapterSubscriptionStatus,
} from '@flopflip/types';
import { ConfigureAdapter, useAdapterSubscription } from '@flopflip/react';
import { FlagsContext } from '../flags-context';

type BaseProps = {
  children?: TConfigureAdapterChildren;
  shouldDeferAdapterConfiguration?: boolean;
  defaultFlags?: TFlags;
};
type Props<AdapterInstance extends TAdapter> = BaseProps &
  TConfigureAdapterProps<AdapterInstance>;
type State = {
  flags: TFlags;
  status: TAdapterStatus;
  configurationId?: string;
};

const initialAdapterStatus: TAdapterStatus = {
  isReady: false,
  subscriptionStatus: TAdapterSubscriptionStatus.Subscribed,
};
const initialFlags: TFlags = {};

const Configure = <AdapterInstance extends TAdapter>(
  props: Props<AdapterInstance>
) => {
  const [flags, setFlags] = React.useState<State['flags']>(initialFlags);
  const [status, setStatus] = React.useState<State['status']>(
    initialAdapterStatus
  );

  // NOTE:
  //   Using this prevents the callbacks being invoked
  //   which would trigger a setState as a result on an unmounted
  //   component.
  const getHasAdapterSubscriptionStatus = useAdapterSubscription(props.adapter);

  const handleUpdateFlags = React.useCallback(
    (flags: TFlagsChange) => {
      if (
        getHasAdapterSubscriptionStatus(TAdapterSubscriptionStatus.Unsubscribed)
      ) {
        return;
      }

      setFlags(prevFlags => ({
        ...prevFlags,
        ...flags,
      }));
    },
    [setFlags, getHasAdapterSubscriptionStatus]
  );

  const handleUpdateStatus = React.useCallback(
    (status: TAdapterStatusChange) => {
      if (
        getHasAdapterSubscriptionStatus(TAdapterSubscriptionStatus.Unsubscribed)
      ) {
        return;
      }

      setStatus(prevStatus => ({
        ...prevStatus,
        ...status,
      }));
    },
    [setStatus, getHasAdapterSubscriptionStatus]
  );

  return (
    <FlagsContext.Provider value={flags}>
      <ConfigureAdapter
        adapter={props.adapter}
        adapterArgs={props.adapterArgs}
        adapterStatus={status}
        defaultFlags={props.defaultFlags}
        shouldDeferAdapterConfiguration={props.shouldDeferAdapterConfiguration}
        onFlagsStateChange={handleUpdateFlags}
        onStatusStateChange={handleUpdateStatus}
      >
        {props.children}
      </ConfigureAdapter>
    </FlagsContext.Provider>
  );
};

Configure.displayName = 'ConfigureFlopflip';
Configure.defaultProps = {
  defaultFlags: {},
  shouldDeferAdapterConfiguration: false,
};

export default Configure;
