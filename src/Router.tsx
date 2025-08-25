import { Routes, Route, BrowserRouter } from "react-router-dom";
import { LandingPage } from "./features/landing/LandingPage.tsx";
import AppPrompt from "./AppPrompt.tsx";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/prompt" element={<AppPrompt />} />
            </Routes>
        </BrowserRouter>
    );
}
