import { Router, type IRouter } from "express";
import healthRouter from "./health";
import wallpapersRouter from "./wallpapers";
import checkoutRouter from "./checkout";
import ordersRouter from "./orders";
import bundlesRouter from "./bundles";
import promosRouter from "./promos";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(wallpapersRouter);
router.use(checkoutRouter);
router.use(ordersRouter);
router.use(bundlesRouter);
router.use(promosRouter);
router.use(settingsRouter);

export default router;
