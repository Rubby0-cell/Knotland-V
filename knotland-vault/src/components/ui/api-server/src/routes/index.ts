import { Router, type IRouter } from "express";
import healthRouter from "./health";
import membersRouter from "./members";
import plansRouter from "./plans";
import paymentsRouter from "./payments";
import announcementsRouter from "./announcements";
import testimonialsRouter from "./testimonials";
import contentRouter from "./content";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(membersRouter);
router.use(plansRouter);
router.use(paymentsRouter);
router.use(announcementsRouter);
router.use(testimonialsRouter);
router.use(contentRouter);
router.use(adminRouter);

export default router;
