import { http, HttpResponse } from 'msw';

// Utility function to calculate the price
const calculatePrice = (lanes, people) => {
  const lanePrice = 100;
  const personPrice = 120;
  return parseInt(lanes, 10) * lanePrice + parseInt(people, 10) * personPrice;
};

// Utility function to get confirmation from session storage
const getConfirmationFromSession = () => {
  const data = sessionStorage.getItem("confirmation");
  return data ? JSON.parse(data) : null;
};

// Utility function to save confirmation to session storage
const saveConfirmationToSession = (confirmation) => {
  sessionStorage.setItem("confirmation", JSON.stringify(confirmation));
};

export const handlers = [
  // Handler for GET request
  http.get("https://h5jbtjv6if.execute-api.eu-north-1.amazonaws.com", () => {
    const confirmation = getConfirmationFromSession();
    return HttpResponse.json(confirmation || { error: "No confirmation found" });
  }),

  // Handler for POST request
  http.post("https://h5jbtjv6if.execute-api.eu-north-1.amazonaws.com", async ({ request }) => {
    const body = await request.json();
    const { when, lanes, people, shoes } = body;

    const price = calculatePrice(lanes, people);
    const confirmation = {
      id: '12345', // Example static ID, could be dynamically generated
      price: price.toString(),
      active: true,
      when,
      lanes,
      people,
      shoes,
    };

    saveConfirmationToSession(confirmation);

    return HttpResponse.json(confirmation);
  }),
];
