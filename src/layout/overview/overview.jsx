import React, { Suspense } from "react";
import { OverviewFilter } from "./components/overview_filter/overview_filter.jsx";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store/index.js";
import { Button } from "../../components/index.js";

const OverviewItinerary = React.lazy(
  () => import("./components/overview_itinerary/index.js"),
);

export function Overview() {
  const { t } = useTranslation();

  const [repoUUID, setRepoUUID, onSettingsOpen] = useStore(
    (state) => [
      state.repoUUID,
      state.setRepoUUID,
      state.onSettingsOpen,
    ],
  );

  const isRepo = repoUUID !== "root";

  function onHome() {
    setRepoUUID("root");
  }

  return (
    <div>
      <div>
        {isRepo ? (
          <Button
            type="button"
            title={t("header.button.back")}
            onClick={() => onHome()}
          >
            {/* &lt;= */}
            🏠
          </Button>
        ) : (
          <div />
        )}

        {isRepo && (
          <Button
            type="button"
            title={t("header.button.back")}
            onClick={onSettingsOpen}
          >
            ⚙️
          </Button>
        )}
      </div>

      <OverviewFilter />

      <Suspense>
        <OverviewItinerary />
      </Suspense>
    </div>
  );
}
