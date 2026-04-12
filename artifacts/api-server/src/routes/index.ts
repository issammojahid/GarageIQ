import { Router, type IRouter } from "express";
import healthRouter from "./health";
import vehiclesRouter from "./vehicles";
import diagnosesRouter from "./diagnoses";
import fuelLogsRouter from "./fuel-logs";
import maintenanceRouter from "./maintenance";
import documentsRouter from "./documents";
import identifyPartRouter from "./identify-part";
import aiProxyRouter from "./ai-proxy";
import mechanicsRouter from "./mechanics";

const router: IRouter = Router();

router.use("/ai-proxy", aiProxyRouter);
router.use(healthRouter);
router.use("/vehicles", vehiclesRouter);
router.use("/diagnoses", diagnosesRouter);
router.use("/fuel-logs", fuelLogsRouter);
router.use("/maintenance", maintenanceRouter);
router.use("/documents", documentsRouter);
router.use("/identify-part", identifyPartRouter);
router.use("/mechanics", mechanicsRouter);

export default router;
