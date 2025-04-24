import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import { routes } from "./routes";
import { Stats } from "@react-three/drei";
import { Leva } from "leva";

const root = createRoot(document.getElementById("app")!);

root.render(
	<React.StrictMode>
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<base href={import.meta.env.BASE_URL}></base>

			<Leva oneLineLabels={true} />

			<Stats />
			
			<Routes>
				{routes.map((route) => (
					<Route key={route.path} {...route} />
				))}
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);