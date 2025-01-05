import { hex_sha256 } from "./sha256.js";

function generate_token(length) {
  var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    .split("");
  var b = [];
  for (var i = 0; i < length; i++) {
    var j = (Math.random() * (a.length - 1)).toFixed(0);
    // @ts-ignore Safe to ignore
    b[i] = a[j];
  }
  return b.join("");
}
function PasswordLogin(value) {
  return hex_sha256(value);
}

const CSRFRegex = /value=(\d{8})/g;

const getLoginPage = await fetch("http://192.168.0.1/login.asp", {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0",
  },
});

const loginPageBody = await getLoginPage.text();

const CSRFValueLoginPage = (loginPageBody.match(CSRFRegex) || []).map((e) =>
  e.replace(CSRFRegex, "$1")
);

const cookies = `doOnlyOnce=true; cookies=501186641290201001011290; token=${
  generate_token(32)
}`;

const userAgent =
  "Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0";

await fetch("http://192.168.0.1/goform/login", {
  body: `CSRFValue=${CSRFValueLoginPage[0]}&loginUsername=voo&loginPassword=${
    PasswordLogin(process.env.WIFI_PASSWORD)
  }&logoffUser=0`,
  method: "POST",
  headers: {
    "User-Agent": userAgent,
    "cookie": cookies,
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

const getRebootPage = await fetch("http://192.168.0.1/RgSecurity.asp", {
  headers: {
    "User-Agent": userAgent,
    "cookie": cookies,
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

const rebootPageBody = await getRebootPage.text();

const CSRFValueRebootPage = (rebootPageBody.match(CSRFRegex) || []).map((e) =>
  e.replace(CSRFRegex, "$1")
);

await fetch("http://192.168.0.1/goform/RgSecurity", {
  method: "POST",
  headers: {
    "User-Agent": userAgent,
    "cookie": cookies,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: `CSRFValue=${CSRFValueRebootPage}&mCmReset=1`,
});
