import { Request, Response } from "express";
import { Category, ICategory } from "../models/Category";
import { Product } from "../models/Product";
import { logActivity } from "../utils/activityLogger";

// Get All Categories with Product Count
export const getAllCategories = async (req: Request, res: Response) => {
	try {
		const categories = await Category.find()
			.select("_id name createdAt")
			.sort({ name: 1 }); // Sort alphabetically

		// Get product count for each category
		const categoriesWithCount = await Promise.all(
			categories.map(async (category) => {
				const productCount = await Product.countDocuments({
					category: category._id,
				});
				return {
					_id: category._id,
					name: category.name,
					productCount,
					createdAt: category.createdAt,
				};
			}),
		);

		res.status(200).json({
			success: true,
			total: categoriesWithCount.length,
			data: categoriesWithCount,
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch categories",
			error: error.message,
		});
	}
};

// Create Category
export const createCategory = async (req: Request, res: Response) => {
	try {
		const { name } = req.body;
		const userId = req.user?.userId;

		// Validation
		if (!name || typeof name !== "string") {
			return res.status(400).json({
				success: false,
				message: "Category name is required",
			});
		}

		const trimmedName = name.trim();

		if (trimmedName.length < 2) {
			return res.status(400).json({
				success: false,
				message: "Category name must be at least 2 characters",
			});
		}

		if (trimmedName.length > 50) {
			return res.status(400).json({
				success: false,
				message: "Category name cannot exceed 50 characters",
			});
		}

		// Check if category already exists (case-insensitive)
		const existingCategory = await Category.findOne({
			name: { $regex: `^${trimmedName}$`, $options: "i" },
		});

		if (existingCategory) {
			return res.status(400).json({
				success: false,
				message: "Category already exists",
			});
		}

		const category = await Category.create({
			name: trimmedName,
			createdBy: userId,
		});

		// Log activity
		await logActivity({
			action: "Category Created",
			entityType: "Category",
			entityId: category._id,
			userId,
			description: `Category created to '${category.name}'`,
		});

		res.status(201).json({
			success: true,
			message: "Category created successfully",
			data: {
				_id: category._id,
				name: category.name,
				productCount: 0,
				createdAt: category.createdAt,
			},
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to create category",
			error: error.message,
		});
	}
};

// Delete Category
export const deleteCategory = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user?.userId;

		// Check if category exists
		const category = await Category.findById(id);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}

		// Check if any products use this category
		const productCount = await Product.countDocuments({ category: id });
		if (productCount > 0) {
			return res.status(400).json({
				success: false,
				message: `Cannot delete — ${productCount} product${productCount !== 1 ? "s are" : " is"} using this category`,
			});
		}

		// Delete the category
		await Category.findByIdAndDelete(id);

		// Log activity
		await logActivity({
			action: "Category Deleted",
			entityType: "Category",
			entityId: id,
			userId,
			description: `Category deleted to '${category.name}'`,
		});

		res.status(200).json({
			success: true,
			message: "Category deleted successfully",
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to delete category",
			error: error.message,
		});
	}
};

// Get Single Category
export const getCategoryById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const category = await Category.findById(id);

		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}

		const productCount = await Product.countDocuments({ category: id });

		res.status(200).json({
			success: true,
			data: {
				_id: category._id,
				name: category.name,
				productCount,
				createdAt: category.createdAt,
			},
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch category",
			error: error.message,
		});
	}
};

// Update Category (not required by spec, but keeping for completeness)
export const updateCategory = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user?.userId;
		const { name } = req.body;

		if (name) {
			const trimmedName = name.trim();

			if (trimmedName.length < 2 || trimmedName.length > 50) {
				return res.status(400).json({
					success: false,
					message:
						"Category name must be between 2 and 50 characters",
				});
			}

			const existingCategory = await Category.findOne({
				name: { $regex: `^${trimmedName}$`, $options: "i" },
				_id: { $ne: id },
			});

			if (existingCategory) {
				return res.status(400).json({
					success: false,
					message: "Category name already exists",
				});
			}
		}

		const category = await Category.findByIdAndUpdate(
			id,
			{ name: name?.trim() },
			{ new: true, runValidators: true },
		);

		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}

		await logActivity({
			action: "Category Updated",
			entityType: "Category",
			entityId: category._id,
			userId,
			description: `Category updated to '${category.name}'`,
		});

		const productCount = await Product.countDocuments({ category: id });

		res.status(200).json({
			success: true,
			message: "Category updated successfully",
			data: {
				_id: category._id,
				name: category.name,
				productCount,
				createdAt: category.createdAt,
			},
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: "Failed to update category",
			error: error.message,
		});
	}
};
