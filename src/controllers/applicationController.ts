import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

// POST /api/applications (Create application)
export const createApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { companyName, jobTitle, jobUrl, source, status, applicationDate, notes } = req.body;

    if (!companyName || !jobTitle || !source) {
      res.status(400).json({ error: 'Company name, job title, and source are required' });
      return;
    }

    const application = await prisma.application.create({
      data: {
        userId,
        companyName,
        jobTitle,
        jobUrl: jobUrl || null,
        source,
        status: status || 'Saved',
        applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
        notes: notes || null
      }
    });

    res.status(201).json({
      message: 'Application created successfully',
      application
    });
  } catch (error: any) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'An error occurred while creating application' });
  }
};

// GET /api/applications (List user's applications with search, filter, and sort)
export const listApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status, source, search, sort } = req.query;

    const whereClause: any = {
      userId: userId
    };

    if (status) {
      whereClause.status = String(status);
    }

    if (source) {
      whereClause.source = String(source);
    }

    if (search) {
      const searchStr = String(search);
      whereClause.OR = [
        { companyName: { contains: searchStr, mode: 'insensitive' } },
        { jobTitle: { contains: searchStr, mode: 'insensitive' } }
      ];
    }

    // Sort by applicationDate or createdAt
    let orderByClause: any = {
      applicationDate: 'desc'
    };

    if (sort === 'oldest') {
      orderByClause = {
        applicationDate: 'asc'
      };
    } else if (sort === 'newest') {
      orderByClause = {
        applicationDate: 'desc'
      };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      orderBy: orderByClause
    });

    res.status(200).json({ applications });
  } catch (error: any) {
    console.error('Error listing applications:', error);
    res.status(500).json({ error: 'An error occurred while fetching applications' });
  }
};

// GET /api/applications/:id (Get one application)
export const getApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id }
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Enforce ownership
    if (application.userId !== userId) {
      res.status(403).json({ error: 'Access denied: You do not own this application' });
      return;
    }

    res.status(200).json({ application });
  } catch (error: any) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ error: 'An error occurred while fetching application details' });
  }
};

// PATCH /api/applications/:id (Update application)
export const updateApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Retrieve the application to check ownership first
    const existingApplication = await prisma.application.findUnique({
      where: { id }
    });

    if (!existingApplication) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Enforce ownership
    if (existingApplication.userId !== userId) {
      res.status(403).json({ error: 'Access denied: You do not own this application' });
      return;
    }

    const { companyName, jobTitle, jobUrl, source, status, applicationDate, notes } = req.body;

    const updatedData: any = {};
    if (companyName !== undefined) updatedData.companyName = companyName;
    if (jobTitle !== undefined) updatedData.jobTitle = jobTitle;
    if (jobUrl !== undefined) updatedData.jobUrl = jobUrl || null;
    if (source !== undefined) updatedData.source = source;
    if (status !== undefined) updatedData.status = status;
    if (applicationDate !== undefined) updatedData.applicationDate = new Date(applicationDate);
    if (notes !== undefined) updatedData.notes = notes || null;

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: updatedData
    });

    res.status(200).json({
      message: 'Application updated successfully',
      application: updatedApplication
    });
  } catch (error: any) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'An error occurred while updating application' });
  }
};

// DELETE /api/applications/:id (Delete application)
export const deleteApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Retrieve application to verify ownership
    const application = await prisma.application.findUnique({
      where: { id }
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Enforce ownership
    if (application.userId !== userId) {
      res.status(403).json({ error: 'Access denied: You do not own this application' });
      return;
    }

    await prisma.application.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'An error occurred while deleting application' });
  }
};
