# 📸 Dataset Sample & Instructions

This directory contains a representative sample of the cattle breed dataset used for this research. 

## Sample Contents
- **Breeds Included**: Sahiwal, Gir, Holstein_Friesian, Ayrshire, Brown_Swiss.
- **Quantity**: 10 images per breed (50 total).
- **Format**: RGB images, 224x224.

## Source & Full Dataset
The full dataset for this project consists of ~5,900 images across 41 Indian bovine breeds.
- **Source**: [Standardized Cattle Breed Dataset] (Internal Research / Kaggle Placeholder).
- **Download**: To replicate the full results, download the `Indian_bovine_breeds.zip` and extract to a `dataset/` root folder.

## Preprocessing Pipeline
1. **Resize**: All images are normalized to **224x224** pixels.
2. **Normalization**: Pixel values are scaled from [0, 255] to **[0, 1]**.
3. **Augmentation**: Training on the full set included rotation (±20°), width/height shifts (20%), and horizontal flips to combat data scarcity.
