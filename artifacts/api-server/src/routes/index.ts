import { Router, type IRouter } from "express";
import healthRouter from "./health";
import wallpapersRouter from "./wallpapers";
import checkoutRouter from "./checkout";

const router: IRouter = Router();

router.use(healthRouter);
router.use(wallpapersRouter);
router.use(checkoutRouter);

export default router;
