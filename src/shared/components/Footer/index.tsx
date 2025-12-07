import React from "react";
import { Link } from "react-router-dom";
import classNames from "clsx";
import { socialNetworks } from "@/shared/shared.constants";
import styles from "./Footer.module.scss";
import { Links } from "../../components/Links";
import { Typography } from "../../components/Typography";
import { Separator } from "../Separator";

export const Footer: React.FC = () => {
  return (
    <>
      <Separator />
      <footer className={styles.footer}>
        <div className={styles.brand}>
          <Typography variant={"heading"} size={"small"}>
            Resources
          </Typography>
          <nav className={classNames(styles.links, styles.column)}>
            <Link to={"#"}>
              <Typography variant={"body"} size={"small"}>
                Documentation
              </Typography>
            </Link>
            <Link to={"#"}>
              <Typography variant={"body"} size={"small"}>
                API Reference
              </Typography>
            </Link>
            <Link to={"#"}>
              <Typography variant={"body"} size={"small"}>
                Status
              </Typography>
            </Link>
          </nav>
        </div>

        <div className={styles.logo}>
          <span className={styles.brandName}>QubicPerp</span>
          <span className={styles.tag}>AI-DEX</span>
          <span className={styles.copyright}>© 2025 QubicPerp. All rights reserved.</span>
        </div>

        <div className={styles.brand}>
          <Typography variant={"heading"} size={"small"}>
            Community
          </Typography>
          <Links data={socialNetworks} className={styles.links} />
        </div>
      </footer>
    </>
  );
};
