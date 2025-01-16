import React from "react";
import 'aos/dist/aos.css';
import {Spinner} from "@nextui-org/react";

const templateNextUI = () => {
    return (
        <>
            <div className="flex gap-4">
                <Spinner color="default"/>
                <Spinner color="primary"/>
                <Spinner color="secondary"/>
                <Spinner color="success"/>
                <Spinner color="warning"/>
                <Spinner color="danger"/>
            </div>
        </>
    )
}
export default templateNextUI;