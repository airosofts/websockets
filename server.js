const bodyParser = require("body-parser");
require('dotenv').config();
const http = require('http');

const express = require("express");
const appexpress = express();
const fs = require("fs");
appexpress.use(bodyParser.json({ limit: "2mb" }));
appexpress.use(bodyParser.urlencoded({ limit: "2mb", extended: true }));
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = "https://rlqdptedhylrommemqiw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscWRwdGVkaHlscm9tbWVtcWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwNjkwMTYsImV4cCI6MjA0MzY0NTAxNn0.Pl0GIeEz1KC7qfPFnsWfBck9Dxfn6Xo2St4O4Bnq9LY";
const supabase = createClient(supabaseUrl, supabaseKey);
const cors = require("cors");
appexpress.use(cors({
  origin: "https://webextractor-production.up.railway.app/", // Replace with the actual client domain
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

const path = require("path");

const axios = require('axios');
const cheerio = require('cheerio');
const csvWriter = require('csv-write-stream');
const async = require('async');
const { PhoneNumberFormat, PhoneNumberUtil } = require('google-libphonenumber');
const phoneUtil = PhoneNumberUtil.getInstance();
var counter=0;
let writer = csvWriter({
    headers: ['URL', 'Emails', 'Phones', 'Facebook', 'YouTube', 'Twitter', 'Instagram', 'LinkedIn']
});
writer.pipe(fs.createWriteStream('output_results3.csv', { flags: 'a' })); // 'a' to append to the file if it already exists

const WebSocket = require('ws');

const socket = new WebSocket('wss://websockets-production-ffaa.up.railway.app/');

// When the WebSocket connection is open
socket.on('open', () => {
  console.log('Connected to WebSocket server');
  socket.send('Hello from the additional server!'); // Test message
});

// Listen for messages from the WebSocket server
socket.on('message', (message) => {
  console.log(`Received message from WebSocket server: ${message}`);
});

// Handle errors
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Handle connection close
socket.on('close', () => {
  console.log('WebSocket connection closed');
});

// Create the WebSocket server
function capitalizeFirstLetter(inputString) {
  if (inputString.length === 0) {
    return inputString;
  }
  // Capitalize the first letter and concatenate it with the rest of the string
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
}

var stopprocess = 0;

//Routes
const dashboardusernameroute = require('./routes/dashboardusername');

appexpress.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});




appexpress.post("/fetchdata", async (req, res) => {
  try {
  console.log("hamzaasad");

      const urlsmain = req.body.text;
  console.log(urlsmain);
      if (urlsmain && typeof urlsmain === 'string') {

          
            const urls = urlsmain.split('\n').filter(is_valid_url);
            urls.forEach(url => queue.push(url));
         
            
           
     
      } else {
      }
      console.log("Processing complete");
      res.status(200).send("Processing complete");
  } catch (error) {
      console.error("Error processing URLs:", error);
      res.status(500).send("Internal Server Error");
  }

});

appexpress.use('/dashboard/get-username', dashboardusernameroute);


appexpress.get("/vallog", async (req, res) => {
  try {
    const username = req.query.email; // Using 'email' as the query param for username
    const passkey = req.query.purchasekey;
    console.log(username, passkey);

    // Fetch user with username and passkey
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("passkey", passkey);

    if (error) throw error;

    if (data.length > 0) {
      const user = data[0];

      // Check if user status is already 'active'
      if (user.status === "active") {
        console.log("Attempt to use already active account.");
        res.json({ loginstatus: "Incorrect login username or passkey" });
      } else {
        // Update user's status to 'active' if not already active
        const { error: updateError } = await supabase
          .from("users")
          .update({ status: "active" })
          .match({ id: user.id });

        if (updateError) throw updateError;

        console.log("Login validated and user activated.");
        res.json({ loginstatus: "Validated", username: username });
        privateuser = username;
      }
    } else {
      console.log("Incorrect login username or passkey.");
      res.json({ loginstatus: "Incorrect login username or passkey" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

appexpress.get("/trial", async (req, res) => {
  try {
    const email = req.query.email; // Assume the correct column name based on your requirement
    console.log("Email received:", email);
  console.log("hamza");
    // Query to check if a user exists based on the email and their status is 'active'
    const { data, error } = await supabase
      .from("users")
      .select("id") // Only fetching the id to check existence and status
      .eq("username", email) // Assuming 'username' is the correct column name for the email
      .eq("status", "active"); // Adding condition for 'active' status

    if (error) {
      throw error; // Throw an error if there is an issue with the query
    }

    if (data.length > 0) {
      // User found with the provided email and is active
      console.log(`Active user found with email: ${email}`);
      res.json({ message: "valid" });
      privateuser = email;
    } else {
      // No active user found with the provided email
      console.log(`No active user found with email: ${email}`);
      res.json({ message: "invalid" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});




appexpress.get("/stopprocess", async (req, res) => {
  const action = req.query.action;
  console.log("Stop Process:", action);

  if (action == 1) {
    stopprocess = 1;
  }

  res.send("Stop process action received.");
});

appexpress.get("/resumeprocess", async (req, res) => {
  const action = req.query.action;
  console.log("Resume Process:", action);

  if (action == 2) {
    stopprocess = 0;
  }

  res.send("Resume process action received.");
});




// Helper functions
function is_valid_url(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

function cfDecodeEmail(encodedString) {
    const r = parseInt(encodedString.slice(0, 2), 16);
    let email = '';
    for (let i = 2; i < encodedString.length; i += 2) {
        const byte = parseInt(encodedString.slice(i, i + 2), 16);
        email += String.fromCharCode(byte ^ r);
    }
    return email;
}

function parse_emails(page) {
    const emails = new Set();
    // Updated to include more variations and specific cases
    const email_regex = /(\b[a-zA-Z0-9._-]+@[a-zA-Z]+\.[a-zA-Z]{2,}\b)/gi;
    const cfemail_regex = /data-cfemail="([a-f0-9]+)"/gi;
    let match;

    // Extract standard emails
    while (match = email_regex.exec(page)) {
        emails.add(match[0]);
    }

    // Extract and decode Cloudflare-protected emails
    while (match = cfemail_regex.exec(page)) {
        const decodedEmail = cfDecodeEmail(match[1]);
        if (decodedEmail) emails.add(decodedEmail);
    }

    return filter_emails([...emails]); // Apply email filter to remove unwanted patterns
}
function filter_emails(emails) {
    const unwanted_patterns = new Set([
        ".png", "sentry.wixpress", "wixpress.com", "example.com", "email.com", "domain.com",
        "godaddy.com", "namecheap.com", "company.com", "sentry.io", ".jpg", ".webp",
        ".svg", "doe.com", "spam.com", "test.com", "tempmail.com", "mailinator.com",
        "fake.com", "null.com", "void.com", "placeholder.com", "temporary.com",
        "dispose.com", "maildrop.cc", "fakemail.com", "nomail.com", "nospam.com",
        "invalid.com", "example.net", "example.org", "discard.email",
        "throwawaymail.com", "garbage.com", "trashmail.com", "burnmail.com",
        "dummy.com", "fictive.com", "ignoremail.com", "moot.com", "mytrashmail.com",
        "spoofmail.de", "deadaddress.com", "zippymail.info", "sharklasers.com",
        "guerrillamail.com", "grr.la", "spam4.me", "anonymbox.com", "notmailinator.com",
        "mytemp.email", "tempemail.co", "yopmail.com", "fakeinbox.com", "mailnesia.com",
        "mailtemp.info", "emailfake.com", "emailwarden.com", "safetymail.info",
        "abusemail.de", "trashmailer.com", "mailforspam.com", "trashdevil.com",
        "mailimate.com", "spambog.com", "spambog.de", "emailgenerator.org",
        "throwawayemailaddress.com", "sute.jp", "moakt.com", "fleckens.hu",
        "stop-my-spam.com", "sweetxxx.de", "bobmail.info", "wegwerfmail.de",
        "wegwerfmail.net", "wegwerfmail.org", "jetable.org", "trashmail.ws",
        "trashmail.me", "trashmail.at", "trashmail.net", "trashmail.de", "0-mail.com",
        "baxomale.ht.cx", "cuvox.de", "rtrtr.com", "4warding.com", "4warding.net",
        "4warding.org", "antichef.com", "antichef.net", "antispam.de", "boun.cr",
        "bouncr.com", "breakthru.com", "bspamfree.org", "casualdx.com", "chogmail.com",
        "choicemail1.com", "cool.fr.nf", "courriel.fr.nf", "curryworld.de", "cust.in",
        "dacoolest.com", "dandikmail.com", "dayrep.com", "divi.express", "yourmail@gmail.com"
    ]);
    return emails.filter(email => ![...unwanted_patterns].some(pat => email.includes(pat)));
  }


function find_phones(page) {
    const phoneNumbers = new Set();
    const phoneRegex = /\+?\d[\d\-\(\) ]{7,}\d/g;
    let match;
    while (match = phoneRegex.exec(page)) {
        try {
            const phoneNumber = phoneUtil.parseAndKeepRawInput(match[0], 'US');
            if (phoneUtil.isValidNumber(phoneNumber)) {
                phoneNumbers.add(phoneUtil.format(phoneNumber, PhoneNumberFormat.INTERNATIONAL));
            }
        } catch (error) {
            // Failed to parse number
        }
    }
    return [...phoneNumbers];
}

function find_social_links($) {
    const social_links = {};
    const platforms = ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube'];
    platforms.forEach(platform => {
        $(`a[href*="${platform}.com"]`).each((_, el) => {
            const href = $(el).attr('href');
            if (!social_links[platform]) {
                social_links[platform] = href;
            }
        });
    });
    return social_links;
}

async function find_relevant_pages($, baseUrl) {
    const relevantLinks = new Set();
    $('a').each((_, el) => {
        const link = $(el).attr('href');
        if (link && (link.includes('contact') || link.includes('about') || link.includes('info'))) {
            relevantLinks.add(new URL(link, baseUrl).href);
        }
    });
   
    return [...relevantLinks];
}

async function scrapePage(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });
        return cheerio.load(response.data);
    } catch (error) {
        console.error(`Failed to retrieve ${url}: ${error}`);
        return null;
    }
}

// Main processing function
async function processUrl(url) {
  let detail = {
    Url: url,
    Emails: [],
    Phones: [],
    SocialLinks: {}
};

    const $ = await scrapePage(url);
    if (!$) return detail;

    const details = {
        Url: url,
        Emails: parse_emails($.html()),
        Phones: find_phones($.html()),
        SocialLinks: find_social_links($)
    };

    const relevantPages = await find_relevant_pages($, url);
    for (const pageUrl of relevantPages) {
        const page$ = await scrapePage(pageUrl);
        if (!page$) continue;

        details.Emails.push(...parse_emails(page$.html()));
        details.Phones.push(...find_phones(page$.html()));
        const socialLinks = find_social_links(page$);
        Object.keys(socialLinks).forEach(platform => {
            if (!details.SocialLinks[platform]) {
                details.SocialLinks[platform] = socialLinks[platform];
            }
        });
    }
    details.Emails = [...new Set(details.Emails)];
    details.Phones = [...new Set(details.Phones)];
    return details;
}

// Concurrency control
const queue = async.queue(async (url, callback) => {
    const result = await processUrl(url);
    if (result) {
  
        const response = {
          Facebook: result.SocialLinks.facebook || '',
          Twitter: result.SocialLinks.twitter || '',
          Instagram: result.SocialLinks.instagram || '',
         Linkedin: result.SocialLinks.linkedin || '',
          Youtube: result.SocialLinks.youtube || '',
          email: result.Emails.join(', '),
          url: result.Url,
          phoneNumbers: result.Phones.join(', '),
        };
        console.log(response);

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(response)); // Ensure `response` is properly formatted
          }
        });
        
    }
    else{
      const response = {
        Facebook: '',
        Twitter: '',
        Instagram: '',
       Linkedin: '',
        Youtube: '',
        email: "",
        phoneNumber: "",
        url: "",
        phoneNumbers: "",
      };

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(response)); // Ensure `response` is properly formatted
        }
      });
      
    }
    callback();
}, 150); 

queue.drain(() => {
    writer.end();
    console.log('All URLs have been processed.');
});
// Start the server
const PORT1 = process.env.PORT || 3008;

appexpress.listen(PORT1, () => {
  console.log(`Server is running on port ${PORT1}`);
});
