import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-P67PYMN545");
};

export const logPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};
