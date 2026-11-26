"use client"

import { addToast, toast } from "@/src/components/ui/toast";
import { ErrorResponse } from "./response";
import { Field } from "@base-ui/react";

export const HandleErrorResponse = (response: ErrorResponse) => {
    if (response.errors) {
        addToast({ title: response.errors[0].field?.charAt(0).toUpperCase() + (response.errors[0].field?.slice(1) ?? ""), description: response.errors[0].message, type: "error" });
        // if (Array.isArray(response.errors)) {
        //     response.errors.forEach((err) => {
        //         addToast({ title: err.field, description: err.message, type: "error" });
        //     })
        // }
    } else {
        addToast({ title: response.message, type: "error" })
    }
}