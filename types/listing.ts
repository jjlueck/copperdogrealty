export interface ListingDetail {
  L_ListingID?: string;
  L_DisplayId?: string;
  
  // Address
  L_AddressNumber?: string;
  L_AddressStreet?: string;
  L_City?: string;
  L_State?: string;
  L_Zip?: string;
  L_Address?: string;

  // Price & Status
  L_AskingPrice?: string;
  L_Status?: string;
  L_StatusCatID?: string;
  L_Class?: string;
  L_Type_?: string;
  L_InputDate?: string;
  L_ListingDate?: string;
  
  // Key Stats
  LM_Int1_11?: string; // Total Beds
  LM_Dec_35?: string;  // Total Baths
  LM_Int2_4?: string;  // SqFt (Living Area)
  LM_Int2_13?: string; // Year Built
  
  // Descriptions
  LR_remarks3636?: string; // Marketing Remarks
  LR_remarks5050?: string; // Other Remarks

  // Features (LFD_)
  LFD_ArchitecturalStyle_5002?: string;
  LFD_BasementMaterial_5005?: string;
  LFD_BasementStyle_5006?: string;
  LFD_ConstructionMaterials_5013?: string;
  LFD_Heating_5027?: string;
  LFD_Sewer_5040?: string;
  LFD_WaterSource_5043?: string;
  LFD_GarageType_5022?: string;
  LFD_Levels_5030?: string;

  // Agent/Office
  LA1_UserFirstName?: string;
  LA1_UserLastName?: string;
  LA1_PhoneNumber1?: string;
  LA1_Email?: string;
  LO1_OrganizationName?: string;
  LO1_PhoneNumber1?: string;
  L_AttributionContact?: string;

  photos?: string[];
}
