"use client";

import {
  getCashoutRequests,
  approveCashoutRequest,
  rejectCashoutRequest,
} from "@/actions/passenger-cashout-requests";
import { toast } from "@/hooks/use-toast";
import { PassengerCashoutRequest } from "@/lib/types";
import { createContext, useContext, useEffect, useState } from "react";

type State = {
  requests: PassengerCashoutRequest[];
};

type Actions = {
  approveRequest: (id: string, actualAmount: number) => Promise<void>;
  rejectRequest: (id: string) => Promise<void>;
};

const PassengerCashoutRequestContext = createContext<(State & Actions) | null>(null);

export function PassengerCashoutRequestProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [requests, setRequests] = useState<PassengerCashoutRequest[]>([]);

  useEffect(() => {
    getCashoutRequests().then(setRequests);
  }, []);

  async function approveRequest(id: string, actualAmount: number) {
    try {
      await approveCashoutRequest(id, actualAmount);
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "approved", actualAmount } : req
        )
      );

      toast({
        title: "Request approved",
        description: "The cashout request has been successfully approved.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Failed to approve request",
        description: "An error occurred while approving the request. Please try again later.",
        variant: "destructive",
      })
    }
  }

  async function rejectRequest(id: string) {
    try {
      await rejectCashoutRequest(id);
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: "rejected" } : req
        )
      );

      toast({
        title: "Request rejected",
        description: "The cashout request has been successfully rejected.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Failed to reject request",
        description: "An error occurred while rejecting the request. Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <PassengerCashoutRequestContext.Provider value={{ requests, approveRequest, rejectRequest }}>
      {children}
    </PassengerCashoutRequestContext.Provider>
  );
}

export function usePassengerCashoutRequest(): State & Actions {
  const context = useContext(PassengerCashoutRequestContext);

  if (!context) {
    throw new Error("usePassengerCashoutRequest must be used within a PassengerCashoutRequestProvider");
  }

  return context;
}
