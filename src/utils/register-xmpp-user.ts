// import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();

// const ejabberdHost = process.env.EJABERED_HOST;
// const adminJID = process.env.EJ_ADMIN_ID;
// const adminPass = process.env.EJ_ADMIN_PASS;
// export async function registerXmppUser(
//   username: string,
//   //   domain: string,
//   password: string
// ) {
//   try {
//     console.log("Ejabbered HOst", ejabberdHost);
//     const res = await axios.post(
//       `http://192.168.1.100:5280/api/register`,
//       {
//         user: username,
//         host: "xmp.2click.app",
//         password: "khan",
//       },
//       {
//         headers: {
//           Authorization: "Basic " + btoa(`${adminJID}:${adminPass}`),
//         },
//         auth: {
//           "admin@xmp.2click.app",
//           password,
//         },
//       }
//     );

//     console.log(res.data);

//     return res.data;
//   } catch (err: any) {
//     console.error(
//       "Error registering XMPP user:",
//       err.response?.data || err.message
//     );
//   }
// }

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ejabberdHost = process.env.EJABERED_HOST || "";
const adminJID = process.env.EJ_ADMIN_ID;
const adminPass = process.env.EJ_ADMIN_PASS;

export async function registerXmppUser(username: string, password: string) {
  try {
    const res = await axios.post(
      ejabberdHost,
      {
        user: username,
        host: "xmp.2click.app",
        password: password,
      },
      {
        auth: {
          username: adminJID || "",
          password: adminPass || "",
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(res);
    return res.data;
  } catch (err: any) {
    console.error(
      "Error registering XMPP user:",
      err.response?.data || err.message
    );
  }
}
