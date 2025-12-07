import { Navigate, useNavigate, useParams } from "react-router-dom";

import classNames from "clsx";

import { getRoute } from "@/lib/router";
import { Loader } from "@/shared/components/Loader";
import { Separator } from "@/shared/components/Separator";
import { Tabs } from "@/shared/components/Tabs";
import { Typography } from "@/shared/components/Typography";
import { useAppTitle } from "@/shared/hooks/useAppTitle";
import { useQubicConnect } from "@/wallet/qubic/QubicConnectContext";

import { USER_ROUTES } from "../../user.constants";
import { UserSettingsTabs } from "../../user.types";
import styles from "./UserSettingsPage.module.scss";

/**
 * Parameters for the UserSettingsLayout component
 * @typedef {Object} UserSettingsLayoutParams
 * @property {UserSettingsTabs} tabId - The ID of the currently selected settings tab
 */
export type UserSettingsPageParams = {
  tabId: UserSettingsTabs;
};

export const UserSettingsPage: React.FC = () => {
  const { wallet } = useQubicConnect();
  const params = useParams<UserSettingsPageParams>();
  const navigate = useNavigate();

  useAppTitle("User settings");

  if (!params?.tabId) {
    return <Navigate to={getRoute(USER_ROUTES.SETTINGS, { tabId: UserSettingsTabs.OVERVIEW })} />;
  }

  if (!wallet?.publicKey || !params.tabId) {
    return (
      <div className={classNames(styles.container, styles.center)}>
        <Loader size={42} className={styles.loader} />
      </div>
    );
  }

  /**
   * Renders the appropriate tab content based on the current tab ID.
   *
   * @returns {JSX.Element} The content of the selected tab.
   */
  const renderTab = () => {
    switch (params.tabId) {
      case UserSettingsTabs.HISTORY:
        return (
          <div className={styles.placeholder}>
            <Typography variant="body" size="large">
              Trade History Coming Soon
            </Typography>
          </div>
        );

      case UserSettingsTabs.PREFERENCES:
        return (
          <div className={styles.placeholder}>
            <Typography variant="body" size="large">
              Preferences Coming Soon
            </Typography>
          </div>
        );

      case UserSettingsTabs.OVERVIEW:
      default:
        return (
          <div className={styles.placeholder}>
            <Typography variant="body" size="large">
              Account Overview Coming Soon
            </Typography>
          </div>
        );
    }
  };

  return (
    <>
      <div className={styles.tabs}>
        <Tabs<UserSettingsTabs>
          size={"large"}
          tabs={[
            {
              id: UserSettingsTabs.OVERVIEW,
              label: "Overview",
            },
            {
              id: UserSettingsTabs.HISTORY,
              label: "History",
            },
            {
              id: UserSettingsTabs.PREFERENCES,
              label: "Preferences",
            },
          ]}
          activeId={params.tabId}
          onChange={(tabId) => navigate(getRoute(USER_ROUTES.SETTINGS, { tabId }))}
        />
      </div>
      <Separator />
      {renderTab()}
    </>
  );
};
