import axios from "axios";
import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";
import { useState, useEffect } from "react";

export const Dashboard = () => {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/account/balance",
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        setBalance(response.data.balance);
      } catch (err) {
        console.error("Failed to fetch balance", err);
      }
    };

    fetchBalance();
  }, []);
  return (
    <div>
      <Appbar />
      <div className="m-8">
        <Balance
          value={
            balance !== null
              ? new Intl.NumberFormat().format(balance)
              : "Loading..."
          }
        />
        <Users />
      </div>
    </div>
  );
};
