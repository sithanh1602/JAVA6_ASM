import React from "react";
import Header from "../components/contact/header";
import ContactForm from "../components/contact/ContactForm";
import Introduction from "../components/contact/Introduction";
import FAQ from "../components/contact/FAQ";

function ContactPage() {
    return (
        <div className="font-sans text-gray-800">
            <Header />
            <ContactForm />
            <Introduction />
        </div>
    );
}

export default ContactPage;
