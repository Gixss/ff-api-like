export const REGIONS = {
  sg: {
    name: "Singapore",
    login: "https://100067.connect.garena.com/oauth/guest/token/grant",
    client: "https://client-sg.ggpolarbear.com",
  },
  bp: {
    name: "Brazil",
    login: "https://100067.connect.garena.com/oauth/guest/token/grant",
    client: "https://clientbp.ggpolarbear.com",
  },
  ind: {
    name: "India",
    login: "https://100067.connect.garena.com/oauth/guest/token/grant",
    client: "https://client.ind.freefiremobile.com",
  },
  id: {
    name: "Indonesia",
    login: "https://100067.connect.garena.com/oauth/guest/token/grant",
    client: "https://client.id.freefiremobile.com",
  },
  th: {
    name: "Thailand",
    login: "https://100067.connect.garena.com/oauth/guest/token/grant",
    client: "https://client.th.freefiremobile.com",
  },
  vn: {
    name: "Vietnam",
    login: "https://100067.connect.garena.com/oauth/guest/token/grant",
    client: "https://client.vn.freefiremobile.com",
  },
  ru: {
    name: "Russia",
    login: "https://100067.connect.garena.com/oauth/guest/token/grant",
    client: "https://client.ru.freefiremobile.com",
  },
  me: {
    name: "Middle East",
    login: "https://100067.connect.garena.com/oauth/guest/token/grant",
    client: "https://client.me.freefiremobile.com",
  },
};

export function getRegion(key) {
  return REGIONS[String(key || "sg").toLowerCase()] || REGIONS.sg;
}

export function listRegions() {
  return Object.entries(REGIONS).map(([k, v]) => ({ code: k, name: v.name }));
}