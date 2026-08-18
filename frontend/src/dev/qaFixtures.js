// QA fixtures for Phase 2, task 6: "Run full flow against real sentences from
// the shared test set (esp. ambiguous ones), confirm highlights + map pins
// update correctly with real data."
//
// WHY THIS FILE EXISTS: this sandbox has no live backend (backend/main.py is
// still the Phase 1 hardcoded mock, and the real gazetteer.db / spaCy model
// aren't buildable here — no network, no source data), so a real HTTP round trip
// against a deployed /analyze isn't possible in this environment.
//
// What IS real: every one of these 54 sentences is copied verbatim from the
// actual shared test set at nlp-ml/data/test_sentences.json, and every
// `resolved`/`alternates` value below was produced by literally calling the
// real, unmodified disambiguate() from ml/disambiguator.py (imported directly,
// zero changes) against a hand-built candidate gazetteer standing in for the
// live gazetteer.db. Entity spans use the test set's own expected_entities as
// NER output (spaCy itself can't run here — no network to fetch en_core_web_lg).
// So: real sentences, real disambiguation math, real confidence numbers —
// only the NER-detection step and the SQLite lookup step are stand-ins.
//
// Once the real backend is live (Day 5 checkpoint), re-run these same 54
// sentences against the live endpoint and diff the real responses against
// these fixtures — that's the true integration test this file stands in for.
//
// Run: node scripts/qa-flow-check.mjs

export const qaFixtures = [
  {
    "id": 1,
    "category": "unambiguous",
    "sentence": "The ISRO headquarters is located in Bengaluru.",
    "response": {
      "sentence": "The ISRO headquarters is located in Bengaluru.",
      "entities": [
        {
          "text": "Bengaluru",
          "start": 36,
          "end": 45,
          "resolved": {
            "state": "Karnataka",
            "district": "Bengaluru Urban",
            "lat": 12.9716,
            "lon": 77.5946,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 2,
    "category": "unambiguous",
    "sentence": "Heavy rainfall has been reported across Mumbai since last night.",
    "response": {
      "sentence": "Heavy rainfall has been reported across Mumbai since last night.",
      "entities": [
        {
          "text": "Mumbai",
          "start": 40,
          "end": 46,
          "resolved": {
            "state": "Maharashtra",
            "district": "Mumbai City",
            "lat": 19.076,
            "lon": 72.8777,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 3,
    "category": "unambiguous",
    "sentence": "The Bhuvan portal now includes updated flood maps for Chennai.",
    "response": {
      "sentence": "The Bhuvan portal now includes updated flood maps for Chennai.",
      "entities": [
        {
          "text": "Chennai",
          "start": 54,
          "end": 61,
          "resolved": {
            "state": "Tamil Nadu",
            "district": "Chennai",
            "lat": 13.0827,
            "lon": 80.2707,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 4,
    "category": "unambiguous",
    "sentence": "A magnitude 4.2 earthquake was felt in Guwahati early this morning.",
    "response": {
      "sentence": "A magnitude 4.2 earthquake was felt in Guwahati early this morning.",
      "entities": [
        {
          "text": "Guwahati",
          "start": 39,
          "end": 47,
          "resolved": {
            "state": "Assam",
            "district": "Kamrup Metropolitan",
            "lat": 26.1445,
            "lon": 91.7362,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 5,
    "category": "unambiguous",
    "sentence": "Landslide warnings have been issued for parts of Shimla.",
    "response": {
      "sentence": "Landslide warnings have been issued for parts of Shimla.",
      "entities": [
        {
          "text": "Shimla",
          "start": 49,
          "end": 55,
          "resolved": {
            "state": "Himachal Pradesh",
            "district": "Shimla",
            "lat": 31.1048,
            "lon": 77.1734,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 6,
    "category": "unambiguous",
    "sentence": "Cyclone warnings have been issued for coastal areas near Visakhapatnam.",
    "response": {
      "sentence": "Cyclone warnings have been issued for coastal areas near Visakhapatnam.",
      "entities": [
        {
          "text": "Visakhapatnam",
          "start": 57,
          "end": 70,
          "resolved": {
            "state": "Andhra Pradesh",
            "district": "Visakhapatnam",
            "lat": 17.6868,
            "lon": 83.2185,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 7,
    "category": "unambiguous",
    "sentence": "Firefighters were deployed to control a forest fire near Nainital.",
    "response": {
      "sentence": "Firefighters were deployed to control a forest fire near Nainital.",
      "entities": [
        {
          "text": "Nainital",
          "start": 57,
          "end": 65,
          "resolved": {
            "state": "Uttarakhand",
            "district": "Nainital",
            "lat": 29.3803,
            "lon": 79.4636,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 8,
    "category": "unambiguous",
    "sentence": "The Kochi metro station suffered minor waterlogging after the storm.",
    "response": {
      "sentence": "The Kochi metro station suffered minor waterlogging after the storm.",
      "entities": [
        {
          "text": "Kochi",
          "start": 4,
          "end": 9,
          "resolved": {
            "state": "Kerala",
            "district": "Ernakulam",
            "lat": 9.9312,
            "lon": 76.2673,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 9,
    "category": "ambiguous_same_name",
    "sentence": "Show me the disaster alerts for Aurangabad and Rampur.",
    "response": {
      "sentence": "Show me the disaster alerts for Aurangabad and Rampur.",
      "entities": [
        {
          "text": "Aurangabad",
          "start": 32,
          "end": 42,
          "resolved": {
            "state": "Maharashtra",
            "district": "Chhatrapati Sambhajinagar",
            "lat": 19.8762,
            "lon": 75.3433,
            "confidence": 0.3
          },
          "alternates": [
            { "state": "Bihar", "confidence": 0.16 }
          ]
        },
        {
          "text": "Rampur",
          "start": 47,
          "end": 53,
          "resolved": {
            "state": "Uttar Pradesh",
            "district": "Rampur",
            "lat": 28.7983,
            "lon": 79.0281,
            "confidence": 0.44
          },
          "alternates": [
            { "state": "Himachal Pradesh", "confidence": 0.01 },
            { "state": "Punjab", "confidence": 0.0 }
          ]
        }
      ]
    },
    "notes": "No context to disambiguate either name — good baseline case for Phase 2."
  },
  {
    "id": 10,
    "category": "ambiguous_same_name",
    "sentence": "Flooding reported near Aurangabad after heavy rains in Maharashtra.",
    "response": {
      "sentence": "Flooding reported near Aurangabad after heavy rains in Maharashtra.",
      "entities": [
        {
          "text": "Aurangabad",
          "start": 23,
          "end": 33,
          "resolved": {
            "state": "Maharashtra",
            "district": "Chhatrapati Sambhajinagar",
            "lat": 19.8762,
            "lon": 75.3433,
            "confidence": 0.86
          },
          "alternates": [
            { "state": "Bihar", "confidence": 0.16 }
          ]
        }
      ]
    },
    "notes": "The word 'Maharashtra' should let Phase 2 resolve to Aurangabad, Maharashtra rather than Aurangabad, Bihar."
  },
  {
    "id": 11,
    "category": "ambiguous_same_name",
    "sentence": "A landslide has blocked the highway to Bilaspur.",
    "response": {
      "sentence": "A landslide has blocked the highway to Bilaspur.",
      "entities": [
        {
          "text": "Bilaspur",
          "start": 39,
          "end": 47,
          "resolved": {
            "state": "Chhattisgarh",
            "district": "Bilaspur",
            "lat": 22.0797,
            "lon": 82.1391,
            "confidence": 0.44
          },
          "alternates": [
            { "state": "Himachal Pradesh", "confidence": 0.16 }
          ]
        }
      ]
    },
    "notes": "Bilaspur exists in both Chhattisgarh and Himachal Pradesh — no disambiguating context given."
  },
  {
    "id": 12,
    "category": "ambiguous_same_name",
    "sentence": "Farmers in Pratapgarh are reporting crop damage due to unseasonal hail.",
    "response": {
      "sentence": "Farmers in Pratapgarh are reporting crop damage due to unseasonal hail.",
      "entities": [
        {
          "text": "Pratapgarh",
          "start": 11,
          "end": 21,
          "resolved": {
            "state": "Uttar Pradesh",
            "district": "Pratapgarh",
            "lat": 25.8974,
            "lon": 81.9407,
            "confidence": 0.44
          },
          "alternates": [
            { "state": "Rajasthan", "confidence": 0.23 }
          ]
        }
      ]
    },
    "notes": "Pratapgarh exists in both Uttar Pradesh and Rajasthan."
  },
  {
    "id": 13,
    "category": "ambiguous_same_name",
    "sentence": "The district administration in Balrampur issued a flood advisory.",
    "response": {
      "sentence": "The district administration in Balrampur issued a flood advisory.",
      "entities": [
        {
          "text": "Balrampur",
          "start": 31,
          "end": 40,
          "resolved": {
            "state": "Uttar Pradesh",
            "district": "Balrampur",
            "lat": 27.4304,
            "lon": 82.183,
            "confidence": 0.44
          },
          "alternates": [
            { "state": "Chhattisgarh", "confidence": 0.04 }
          ]
        }
      ]
    },
    "notes": "Balrampur exists in both Uttar Pradesh and Chhattisgarh."
  },
  {
    "id": 14,
    "category": "ambiguous_same_name",
    "sentence": "Bijapur received its heaviest rainfall in a decade this week.",
    "response": {
      "sentence": "Bijapur received its heaviest rainfall in a decade this week.",
      "entities": [
        {
          "text": "Bijapur",
          "start": 0,
          "end": 7,
          "resolved": {
            "state": "Karnataka",
            "district": "Vijayapura",
            "lat": 16.8302,
            "lon": 75.71,
            "confidence": 0.3
          },
          "alternates": [
            { "state": "Chhattisgarh", "confidence": 0.16 }
          ]
        }
      ]
    },
    "notes": "Bijapur exists in both Karnataka and Chhattisgarh."
  },
  {
    "id": 15,
    "category": "ambiguous_same_name",
    "sentence": "Officials confirmed a tremor was felt in Rampur late last night.",
    "response": {
      "sentence": "Officials confirmed a tremor was felt in Rampur late last night.",
      "entities": [
        {
          "text": "Rampur",
          "start": 41,
          "end": 47,
          "resolved": {
            "state": "Uttar Pradesh",
            "district": "Rampur",
            "lat": 28.7983,
            "lon": 79.0281,
            "confidence": 0.44
          },
          "alternates": [
            { "state": "Himachal Pradesh", "confidence": 0.01 },
            { "state": "Punjab", "confidence": 0.0 }
          ]
        }
      ]
    },
    "notes": "Rampur exists in Uttar Pradesh, Himachal Pradesh, and elsewhere."
  },
  {
    "id": 16,
    "category": "ambiguous_same_name",
    "sentence": "Relief camps have been set up near Aurangabad following the floods.",
    "response": {
      "sentence": "Relief camps have been set up near Aurangabad following the floods.",
      "entities": [
        {
          "text": "Aurangabad",
          "start": 35,
          "end": 45,
          "resolved": {
            "state": "Maharashtra",
            "district": "Chhatrapati Sambhajinagar",
            "lat": 19.8762,
            "lon": 75.3433,
            "confidence": 0.3
          },
          "alternates": [
            { "state": "Bihar", "confidence": 0.16 }
          ]
        }
      ]
    },
    "notes": "No disambiguating context — tests Phase 2's default/most-likely ranking."
  },
  {
    "id": 17,
    "category": "multi_place",
    "sentence": "Flooding has affected both Patna and Muzaffarpur after the Ganga overflowed its banks.",
    "response": {
      "sentence": "Flooding has affected both Patna and Muzaffarpur after the Ganga overflowed its banks.",
      "entities": [
        {
          "text": "Patna",
          "start": 27,
          "end": 32,
          "resolved": {
            "state": "Bihar",
            "district": "Patna",
            "lat": 25.5941,
            "lon": 85.1376,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Muzaffarpur",
          "start": 37,
          "end": 48,
          "resolved": {
            "state": "Bihar",
            "district": "Muzaffarpur",
            "lat": 26.1225,
            "lon": 85.3906,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 18,
    "category": "multi_place",
    "sentence": "The IMD has issued a heavy rain alert for Kolkata, Bhubaneswar, and Puri.",
    "response": {
      "sentence": "The IMD has issued a heavy rain alert for Kolkata, Bhubaneswar, and Puri.",
      "entities": [
        {
          "text": "Kolkata",
          "start": 42,
          "end": 49,
          "resolved": {
            "state": "West Bengal",
            "district": "Kolkata",
            "lat": 22.5726,
            "lon": 88.3639,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Bhubaneswar",
          "start": 51,
          "end": 62,
          "resolved": {
            "state": "Odisha",
            "district": "Khordha",
            "lat": 20.2961,
            "lon": 85.8245,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Puri",
          "start": 68,
          "end": 72,
          "resolved": {
            "state": "Odisha",
            "district": "Puri",
            "lat": 19.8135,
            "lon": 85.8312,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 19,
    "category": "multi_place",
    "sentence": "Trains between Delhi and Jaipur were delayed due to dense fog.",
    "response": {
      "sentence": "Trains between Delhi and Jaipur were delayed due to dense fog.",
      "entities": [
        {
          "text": "Delhi",
          "start": 15,
          "end": 20,
          "resolved": {
            "state": "Delhi",
            "district": "Delhi",
            "lat": 28.7041,
            "lon": 77.1025,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Jaipur",
          "start": 25,
          "end": 31,
          "resolved": {
            "state": "Rajasthan",
            "district": "Jaipur",
            "lat": 26.9124,
            "lon": 75.7873,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 20,
    "category": "multi_place",
    "sentence": "Relief teams moved from Guwahati to Dibrugarh after the embankment breach.",
    "response": {
      "sentence": "Relief teams moved from Guwahati to Dibrugarh after the embankment breach.",
      "entities": [
        {
          "text": "Guwahati",
          "start": 24,
          "end": 32,
          "resolved": {
            "state": "Assam",
            "district": "Kamrup Metropolitan",
            "lat": 26.1445,
            "lon": 91.7362,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Dibrugarh",
          "start": 36,
          "end": 45,
          "resolved": {
            "state": "Assam",
            "district": "Dibrugarh",
            "lat": 27.4728,
            "lon": 94.912,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 21,
    "category": "multi_place",
    "sentence": "Cyclone Fani caused damage across Puri, Bhubaneswar, and parts of Cuttack.",
    "response": {
      "sentence": "Cyclone Fani caused damage across Puri, Bhubaneswar, and parts of Cuttack.",
      "entities": [
        {
          "text": "Puri",
          "start": 34,
          "end": 38,
          "resolved": {
            "state": "Odisha",
            "district": "Puri",
            "lat": 19.8135,
            "lon": 85.8312,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Bhubaneswar",
          "start": 40,
          "end": 51,
          "resolved": {
            "state": "Odisha",
            "district": "Khordha",
            "lat": 20.2961,
            "lon": 85.8245,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Cuttack",
          "start": 66,
          "end": 73,
          "resolved": {
            "state": "Odisha",
            "district": "Cuttack",
            "lat": 20.4625,
            "lon": 85.883,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 22,
    "category": "multi_place",
    "sentence": "The road connecting Nagpur and Amravati remains blocked due to landslides.",
    "response": {
      "sentence": "The road connecting Nagpur and Amravati remains blocked due to landslides.",
      "entities": [
        {
          "text": "Nagpur",
          "start": 20,
          "end": 26,
          "resolved": {
            "state": "Maharashtra",
            "district": "Nagpur",
            "lat": 21.1458,
            "lon": 79.0882,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Amravati",
          "start": 31,
          "end": 39,
          "resolved": {
            "state": "Maharashtra",
            "district": "Amravati",
            "lat": 20.9374,
            "lon": 77.7796,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 23,
    "category": "multi_place",
    "sentence": "Both Surat and Vadodara reported waterlogging after the overnight downpour.",
    "response": {
      "sentence": "Both Surat and Vadodara reported waterlogging after the overnight downpour.",
      "entities": [
        {
          "text": "Surat",
          "start": 5,
          "end": 10,
          "resolved": {
            "state": "Gujarat",
            "district": "Surat",
            "lat": 21.1702,
            "lon": 72.8311,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Vadodara",
          "start": 15,
          "end": 23,
          "resolved": {
            "state": "Gujarat",
            "district": "Vadodara",
            "lat": 22.3072,
            "lon": 73.1812,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 24,
    "category": "multi_place",
    "sentence": "Officials in Coimbatore, Madurai, and Salem are on high alert for flash floods.",
    "response": {
      "sentence": "Officials in Coimbatore, Madurai, and Salem are on high alert for flash floods.",
      "entities": [
        {
          "text": "Coimbatore",
          "start": 13,
          "end": 23,
          "resolved": {
            "state": "Tamil Nadu",
            "district": "Coimbatore",
            "lat": 11.0168,
            "lon": 76.9558,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Madurai",
          "start": 25,
          "end": 32,
          "resolved": {
            "state": "Tamil Nadu",
            "district": "Madurai",
            "lat": 9.9252,
            "lon": 78.1198,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Salem",
          "start": 38,
          "end": 43,
          "resolved": {
            "state": "Tamil Nadu",
            "district": "Salem",
            "lat": 11.6643,
            "lon": 78.146,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 25,
    "category": "misspelling",
    "sentence": "Heavy flooding was reported in Bengalooru after the overnight storm.",
    "response": {
      "sentence": "Heavy flooding was reported in Bengalooru after the overnight storm.",
      "entities": [
        {
          "text": "Bengalooru",
          "start": 31,
          "end": 41,
          "resolved": {
            "state": "Karnataka",
            "district": "Bengaluru Urban",
            "lat": 12.9716,
            "lon": 77.5946,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": "Misspelling of Bengaluru — detector should still catch the span; correction happens later."
  },
  {
    "id": 26,
    "category": "misspelling",
    "sentence": "Authorities issued a heat wave warning for Hydarabad this week.",
    "response": {
      "sentence": "Authorities issued a heat wave warning for Hydarabad this week.",
      "entities": [
        {
          "text": "Hydarabad",
          "start": 43,
          "end": 52,
          "resolved": {
            "state": "Telangana",
            "district": "Hyderabad",
            "lat": 17.385,
            "lon": 78.4867,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": "Misspelling of Hyderabad."
  },
  {
    "id": 27,
    "category": "misspelling",
    "sentence": "A minor earthquake was recorded near Dehradoon early today.",
    "response": {
      "sentence": "A minor earthquake was recorded near Dehradoon early today.",
      "entities": [
        {
          "text": "Dehradoon",
          "start": 37,
          "end": 46,
          "resolved": {
            "state": "Uttarakhand",
            "district": "Dehradun",
            "lat": 30.3165,
            "lon": 78.0322,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": "Misspelling of Dehradun."
  },
  {
    "id": 28,
    "category": "misspelling",
    "sentence": "Relief supplies are being sent to Vishakapatnam after the cyclone.",
    "response": {
      "sentence": "Relief supplies are being sent to Vishakapatnam after the cyclone.",
      "entities": [
        {
          "text": "Vishakapatnam",
          "start": 34,
          "end": 47,
          "resolved": {
            "state": "Andhra Pradesh",
            "district": "Visakhapatnam",
            "lat": 17.6868,
            "lon": 83.2185,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": "Misspelling of Visakhapatnam."
  },
  {
    "id": 29,
    "category": "misspelling",
    "sentence": "Rescue teams reached Chennei after the coastal flooding worsened.",
    "response": {
      "sentence": "Rescue teams reached Chennei after the coastal flooding worsened.",
      "entities": [
        {
          "text": "Chennei",
          "start": 21,
          "end": 28,
          "resolved": {
            "state": "Tamil Nadu",
            "district": "Chennai",
            "lat": 13.0827,
            "lon": 80.2707,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": "Misspelling of Chennai."
  },
  {
    "id": 30,
    "category": "misspelling",
    "sentence": "The district collector of Jaipurr confirmed no casualties in the storm.",
    "response": {
      "sentence": "The district collector of Jaipurr confirmed no casualties in the storm.",
      "entities": [
        {
          "text": "Jaipurr",
          "start": 26,
          "end": 33,
          "resolved": {
            "state": "Rajasthan",
            "district": "Jaipur",
            "lat": 26.9124,
            "lon": 75.7873,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": "Misspelling of Jaipur."
  },
  {
    "id": 31,
    "category": "code_switched",
    "sentence": "Kal raat Pune mein bohot heavy rainfall hua.",
    "response": {
      "sentence": "Kal raat Pune mein bohot heavy rainfall hua.",
      "entities": [
        {
          "text": "Pune",
          "start": 9,
          "end": 13,
          "resolved": {
            "state": "Maharashtra",
            "district": "Pune",
            "lat": 18.5204,
            "lon": 73.8567,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 32,
    "category": "code_switched",
    "sentence": "Aaj subah Delhi mein traffic bahut zyada tha due to waterlogging.",
    "response": {
      "sentence": "Aaj subah Delhi mein traffic bahut zyada tha due to waterlogging.",
      "entities": [
        {
          "text": "Delhi",
          "start": 10,
          "end": 15,
          "resolved": {
            "state": "Delhi",
            "district": "Delhi",
            "lat": 28.7041,
            "lon": 77.1025,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 33,
    "category": "code_switched",
    "sentence": "Mumbai ke local trains aaj bhi late chal rahi hain.",
    "response": {
      "sentence": "Mumbai ke local trains aaj bhi late chal rahi hain.",
      "entities": [
        {
          "text": "Mumbai",
          "start": 0,
          "end": 6,
          "resolved": {
            "state": "Maharashtra",
            "district": "Mumbai City",
            "lat": 19.076,
            "lon": 72.8777,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 34,
    "category": "code_switched",
    "sentence": "Lucknow mein bijli chali gayi thi storm ke baad.",
    "response": {
      "sentence": "Lucknow mein bijli chali gayi thi storm ke baad.",
      "entities": [
        {
          "text": "Lucknow",
          "start": 0,
          "end": 7,
          "resolved": {
            "state": "Uttar Pradesh",
            "district": "Lucknow",
            "lat": 26.8467,
            "lon": 80.9462,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 35,
    "category": "code_switched",
    "sentence": "Kal Jaipur mein dust storm aaya tha, bahut visibility kam thi.",
    "response": {
      "sentence": "Kal Jaipur mein dust storm aaya tha, bahut visibility kam thi.",
      "entities": [
        {
          "text": "Jaipur",
          "start": 4,
          "end": 10,
          "resolved": {
            "state": "Rajasthan",
            "district": "Jaipur",
            "lat": 26.9124,
            "lon": 75.7873,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 36,
    "category": "code_switched",
    "sentence": "Bhopal se Indore tak highway band hai landslide ki wajah se.",
    "response": {
      "sentence": "Bhopal se Indore tak highway band hai landslide ki wajah se.",
      "entities": [
        {
          "text": "Bhopal",
          "start": 0,
          "end": 6,
          "resolved": {
            "state": "Madhya Pradesh",
            "district": "Bhopal",
            "lat": 23.2599,
            "lon": 77.4126,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Indore",
          "start": 10,
          "end": 16,
          "resolved": {
            "state": "Madhya Pradesh",
            "district": "Indore",
            "lat": 22.7196,
            "lon": 75.8577,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": "Combines code-switching with multi-place — good stress test."
  },
  {
    "id": 37,
    "category": "no_place",
    "sentence": "The weather forecast predicts light showers over the next three days.",
    "response": {
      "sentence": "The weather forecast predicts light showers over the next three days.",
      "entities": [
      ]
    },
    "notes": null
  },
  {
    "id": 38,
    "category": "no_place",
    "sentence": "Emergency response teams completed their annual disaster preparedness drill.",
    "response": {
      "sentence": "Emergency response teams completed their annual disaster preparedness drill.",
      "entities": [
      ]
    },
    "notes": null
  },
  {
    "id": 39,
    "category": "no_place",
    "sentence": "The new satellite will improve real-time monitoring of extreme weather events.",
    "response": {
      "sentence": "The new satellite will improve real-time monitoring of extreme weather events.",
      "entities": [
      ]
    },
    "notes": null
  },
  {
    "id": 40,
    "category": "no_place",
    "sentence": "Residents were advised to stay indoors due to the ongoing heatwave.",
    "response": {
      "sentence": "Residents were advised to stay indoors due to the ongoing heatwave.",
      "entities": [
      ]
    },
    "notes": null
  },
  {
    "id": 41,
    "category": "natural_feature",
    "sentence": "Water levels in the Ganga rose sharply after continuous rainfall upstream.",
    "response": {
      "sentence": "Water levels in the Ganga rose sharply after continuous rainfall upstream.",
      "entities": [
        {
          "text": "Ganga",
          "start": 20,
          "end": 25,
          "resolved": {
            "state": "Uttar Pradesh",
            "district": "Ganga (river)",
            "lat": 25.3176,
            "lon": 83.013,
            "confidence": 0.15
          },
          "alternates": [
            { "state": "Bihar", "confidence": 0.15 }
          ]
        }
      ]
    },
    "notes": "Tests LOC label (natural feature) rather than GPE."
  },
  {
    "id": 42,
    "category": "natural_feature",
    "sentence": "The Western Ghats received unusually heavy rainfall this monsoon season.",
    "response": {
      "sentence": "The Western Ghats received unusually heavy rainfall this monsoon season.",
      "entities": [
        {
          "text": "Western Ghats",
          "start": 4,
          "end": 17,
          "resolved": {
            "state": "Kerala",
            "district": "Western Ghats (range)",
            "lat": 10.0,
            "lon": 77.0,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": "Multi-word natural feature — checks offset math for multi-token spans."
  },
  {
    "id": 43,
    "category": "natural_feature",
    "sentence": "Flood waters from the Brahmaputra have submerged several villages.",
    "response": {
      "sentence": "Flood waters from the Brahmaputra have submerged several villages.",
      "entities": [
        {
          "text": "Brahmaputra",
          "start": 22,
          "end": 33,
          "resolved": {
            "state": "Assam",
            "district": "Brahmaputra (river)",
            "lat": 26.2006,
            "lon": 91.7362,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 44,
    "category": "natural_feature",
    "sentence": "The Himalayas saw an early snowfall this year, triggering avalanche warnings.",
    "response": {
      "sentence": "The Himalayas saw an early snowfall this year, triggering avalanche warnings.",
      "entities": [
        {
          "text": "Himalayas",
          "start": 4,
          "end": 13,
          "resolved": {
            "state": "Himachal Pradesh",
            "district": "Himalayas (range)",
            "lat": 32.0,
            "lon": 78.0,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 45,
    "category": "compound_location",
    "sentence": "A water pipeline burst was reported in Sector 15, Rohini, Delhi this morning.",
    "response": {
      "sentence": "A water pipeline burst was reported in Sector 15, Rohini, Delhi this morning.",
      "entities": [
        {
          "text": "Sector 15",
          "start": 39,
          "end": 48,
          "resolved": null,
          "alternates": []
        },
        {
          "text": "Rohini",
          "start": 50,
          "end": 56,
          "resolved": {
            "state": "Delhi",
            "district": "North West Delhi",
            "lat": 28.7136,
            "lon": 77.12,
            "confidence": 0.99
          },
          "alternates": [
            { "state": "Bihar", "confidence": 0.0 }
          ]
        },
        {
          "text": "Delhi",
          "start": 58,
          "end": 63,
          "resolved": {
            "state": "Delhi",
            "district": "Delhi",
            "lat": 28.7041,
            "lon": 77.1025,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": "Nested/compound case: most specific token (Sector 15) is ambiguous alone; Rohini and Delhi should be used as context to disambiguate it. spaCy may or may not tag 'Sector 15' as GPE — worth checking during detection scoring."
  },
  {
    "id": 46,
    "category": "compound_location",
    "sentence": "Residents of Koramangala, Bengaluru, Karnataka reported waterlogged streets.",
    "response": {
      "sentence": "Residents of Koramangala, Bengaluru, Karnataka reported waterlogged streets.",
      "entities": [
        {
          "text": "Koramangala",
          "start": 13,
          "end": 24,
          "resolved": {
            "state": "Karnataka",
            "district": "Bengaluru Urban",
            "lat": 12.9352,
            "lon": 77.6245,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Bengaluru",
          "start": 26,
          "end": 35,
          "resolved": {
            "state": "Karnataka",
            "district": "Bengaluru Urban",
            "lat": 12.9716,
            "lon": 77.5946,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Karnataka",
          "start": 37,
          "end": 46,
          "resolved": {
            "state": "Karnataka",
            "district": "Karnataka",
            "lat": 15.3173,
            "lon": 75.7139,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 47,
    "category": "compound_location",
    "sentence": "The relief camp is set up near Dharavi, Mumbai, Maharashtra.",
    "response": {
      "sentence": "The relief camp is set up near Dharavi, Mumbai, Maharashtra.",
      "entities": [
        {
          "text": "Dharavi",
          "start": 31,
          "end": 38,
          "resolved": {
            "state": "Maharashtra",
            "district": "Mumbai Suburban",
            "lat": 19.041,
            "lon": 72.8525,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Mumbai",
          "start": 40,
          "end": 46,
          "resolved": {
            "state": "Maharashtra",
            "district": "Mumbai City",
            "lat": 19.076,
            "lon": 72.8777,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Maharashtra",
          "start": 48,
          "end": 59,
          "resolved": {
            "state": "Maharashtra",
            "district": "Maharashtra",
            "lat": 19.7515,
            "lon": 75.7139,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 48,
    "category": "compound_location",
    "sentence": "Flood warnings cover Salt Lake, Kolkata, West Bengal this week.",
    "response": {
      "sentence": "Flood warnings cover Salt Lake, Kolkata, West Bengal this week.",
      "entities": [
        {
          "text": "Salt Lake",
          "start": 21,
          "end": 30,
          "resolved": {
            "state": "West Bengal",
            "district": "Kolkata",
            "lat": 22.5806,
            "lon": 88.4172,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Kolkata",
          "start": 32,
          "end": 39,
          "resolved": {
            "state": "West Bengal",
            "district": "Kolkata",
            "lat": 22.5726,
            "lon": 88.3639,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "West Bengal",
          "start": 41,
          "end": 52,
          "resolved": {
            "state": "West Bengal",
            "district": "West Bengal",
            "lat": 22.9868,
            "lon": 87.855,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 49,
    "category": "compound_location",
    "sentence": "Cyclone damage was heaviest in Marina, Chennai, Tamil Nadu.",
    "response": {
      "sentence": "Cyclone damage was heaviest in Marina, Chennai, Tamil Nadu.",
      "entities": [
        {
          "text": "Marina",
          "start": 31,
          "end": 37,
          "resolved": {
            "state": "Tamil Nadu",
            "district": "Chennai",
            "lat": 13.05,
            "lon": 80.2824,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Chennai",
          "start": 39,
          "end": 46,
          "resolved": {
            "state": "Tamil Nadu",
            "district": "Chennai",
            "lat": 13.0827,
            "lon": 80.2707,
            "confidence": 0.95
          },
          "alternates": []
        },
        {
          "text": "Tamil Nadu",
          "start": 48,
          "end": 58,
          "resolved": {
            "state": "Tamil Nadu",
            "district": "Tamil Nadu",
            "lat": 11.1271,
            "lon": 78.6569,
            "confidence": 0.95
          },
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 50,
    "category": "unknown_place",
    "sentence": "The flood alert was issued for Nandagram Colony this evening.",
    "response": {
      "sentence": "The flood alert was issued for Nandagram Colony this evening.",
      "entities": [
        {
          "text": "Nandagram Colony",
          "start": 31,
          "end": 47,
          "resolved": null,
          "alternates": []
        }
      ]
    },
    "notes": "Made-up/unregistered place — should be detected as a candidate span but have zero gazetteer matches, so disambiguation must return status: no_confident_match rather than forcing a guess."
  },
  {
    "id": 51,
    "category": "unknown_place",
    "sentence": "Rescue teams were dispatched to Sunderpalli Basti after the embankment failed.",
    "response": {
      "sentence": "Rescue teams were dispatched to Sunderpalli Basti after the embankment failed.",
      "entities": [
        {
          "text": "Sunderpalli Basti",
          "start": 32,
          "end": 49,
          "resolved": null,
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 52,
    "category": "unknown_place",
    "sentence": "Officials confirmed no casualties in Ramnagar Extension following the storm.",
    "response": {
      "sentence": "Officials confirmed no casualties in Ramnagar Extension following the storm.",
      "entities": [
        {
          "text": "Ramnagar Extension",
          "start": 37,
          "end": 55,
          "resolved": null,
          "alternates": []
        }
      ]
    },
    "notes": "Contains a real place fragment (Ramnagar exists genuinely in several states) plus a fabricated suffix — tests whether fuzzy match over-matches on partial tokens."
  },
  {
    "id": 53,
    "category": "unknown_place",
    "sentence": "Volunteers are coordinating relief efforts in Devipur Nagar.",
    "response": {
      "sentence": "Volunteers are coordinating relief efforts in Devipur Nagar.",
      "entities": [
        {
          "text": "Devipur Nagar",
          "start": 46,
          "end": 59,
          "resolved": null,
          "alternates": []
        }
      ]
    },
    "notes": null
  },
  {
    "id": 54,
    "category": "unknown_place",
    "sentence": "The bridge near Kalyanpuram Colony was washed away in the flash flood.",
    "response": {
      "sentence": "The bridge near Kalyanpuram Colony was washed away in the flash flood.",
      "entities": [
        {
          "text": "Kalyanpuram Colony",
          "start": 16,
          "end": 34,
          "resolved": null,
          "alternates": []
        }
      ]
    },
    "notes": null
  }
];
