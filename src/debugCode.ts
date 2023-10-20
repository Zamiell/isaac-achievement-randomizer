import {
  isRoomDangerous,
  log,
  logAndPrint,
  setLogFunctionsGlobal,
  setTracebackFunctionsGlobal,
} from "isaacscript-common";
import { mod } from "./mod";

/** Currently, F3 is set to execute this function. */
function debugCode(_params?: string) {
  // Add code here.
  /// startRandomizer(RandomizerMode.HARDCORE, undefined);
  print(isRoomDangerous());
}

/** Hotkey 1 is bound to F3. */
export function hotkey1Function(): void {
  logAndPrint("Hotkey 1 activated.");
  debugCode();
}

/** Hotkey 2 is bound to F4. */
export function hotkey2Function(): void {
  logAndPrint("Hotkey 2 activated.");
}

/** Executed from the "d" console command. */
export function debugFunction(params?: string): void {
  setLogFunctionsGlobal();
  setTracebackFunctionsGlobal();
  mod.saveDataManagerSetGlobal();

  print("Executing debug function.");
  log("Entering debug function.");
  debugCode(params);
  log("Exiting debug function.");
}

const CRC32 = [
  0x00_00_00_00, 0x77_07_30_96, 0xee_0e_61_2c, 0x99_09_51_ba, 0x07_6d_c4_19,
  0x70_6a_f4_8f, 0xe9_63_a5_35, 0x9e_64_95_a3, 0x0e_db_88_32, 0x79_dc_b8_a4,
  0xe0_d5_e9_1e, 0x97_d2_d9_88, 0x09_b6_4c_2b, 0x7e_b1_7c_bd, 0xe7_b8_2d_07,
  0x90_bf_1d_91, 0x1d_b7_10_64, 0x6a_b0_20_f2, 0xf3_b9_71_48, 0x84_be_41_de,
  0x1a_da_d4_7d, 0x6d_dd_e4_eb, 0xf4_d4_b5_51, 0x83_d3_85_c7, 0x13_6c_98_56,
  0x64_6b_a8_c0, 0xfd_62_f9_7a, 0x8a_65_c9_ec, 0x14_01_5c_4f, 0x63_06_6c_d9,
  0xfa_0f_3d_63, 0x8d_08_0d_f5, 0x3b_6e_20_c8, 0x4c_69_10_5e, 0xd5_60_41_e4,
  0xa2_67_71_72, 0x3c_03_e4_d1, 0x4b_04_d4_47, 0xd2_0d_85_fd, 0xa5_0a_b5_6b,
  0x35_b5_a8_fa, 0x42_b2_98_6c, 0xdb_bb_c9_d6, 0xac_bc_f9_40, 0x32_d8_6c_e3,
  0x45_df_5c_75, 0xdc_d6_0d_cf, 0xab_d1_3d_59, 0x26_d9_30_ac, 0x51_de_00_3a,
  0xc8_d7_51_80, 0xbf_d0_61_16, 0x21_b4_f4_b5, 0x56_b3_c4_23, 0xcf_ba_95_99,
  0xb8_bd_a5_0f, 0x28_02_b8_9e, 0x5f_05_88_08, 0xc6_0c_d9_b2, 0xb1_0b_e9_24,
  0x2f_6f_7c_87, 0x58_68_4c_11, 0xc1_61_1d_ab, 0xb6_66_2d_3d, 0x76_dc_41_90,
  0x01_db_71_06, 0x98_d2_20_bc, 0xef_d5_10_2a, 0x71_b1_85_89, 0x06_b6_b5_1f,
  0x9f_bf_e4_a5, 0xe8_b8_d4_33, 0x78_07_c9_a2, 0x0f_00_f9_34, 0x96_09_a8_8e,
  0xe1_0e_98_18, 0x7f_6a_0d_bb, 0x08_6d_3d_2d, 0x91_64_6c_97, 0xe6_63_5c_01,
  0x6b_6b_51_f4, 0x1c_6c_61_62, 0x85_65_30_d8, 0xf2_62_00_4e, 0x6c_06_95_ed,
  0x1b_01_a5_7b, 0x82_08_f4_c1, 0xf5_0f_c4_57, 0x65_b0_d9_c6, 0x12_b7_e9_50,
  0x8b_be_b8_ea, 0xfc_b9_88_7c, 0x62_dd_1d_df, 0x15_da_2d_49, 0x8c_d3_7c_f3,
  0xfb_d4_4c_65, 0x4d_b2_61_58, 0x3a_b5_51_ce, 0xa3_bc_00_74, 0xd4_bb_30_e2,
  0x4a_df_a5_41, 0x3d_d8_95_d7, 0xa4_d1_c4_6d, 0xd3_d6_f4_fb, 0x43_69_e9_6a,
  0x34_6e_d9_fc, 0xad_67_88_46, 0xda_60_b8_d0, 0x44_04_2d_73, 0x33_03_1d_e5,
  0xaa_0a_4c_5f, 0xdd_0d_7c_c9, 0x50_05_71_3c, 0x27_02_41_aa, 0xbe_0b_10_10,
  0xc9_0c_20_86, 0x57_68_b5_25, 0x20_6f_85_b3, 0xb9_66_d4_09, 0xce_61_e4_9f,
  0x5e_de_f9_0e, 0x29_d9_c9_98, 0xb0_d0_98_22, 0xc7_d7_a8_b4, 0x59_b3_3d_17,
  0x2e_b4_0d_81, 0xb7_bd_5c_3b, 0xc0_ba_6c_ad, 0xed_b8_83_20, 0x9a_bf_b3_b6,
  0x03_b6_e2_0c, 0x74_b1_d2_9a, 0xea_d5_47_39, 0x9d_d2_77_af, 0x04_db_26_15,
  0x73_dc_16_83, 0xe3_63_0b_12, 0x94_64_3b_84, 0x0d_6d_6a_3e, 0x7a_6a_5a_a8,
  0xe4_0e_cf_0b, 0x93_09_ff_9d, 0x0a_00_ae_27, 0x7d_07_9e_b1, 0xf0_0f_93_44,
  0x87_08_a3_d2, 0x1e_01_f2_68, 0x69_06_c2_fe, 0xf7_62_57_5d, 0x80_65_67_cb,
  0x19_6c_36_71, 0x6e_6b_06_e7, 0xfe_d4_1b_76, 0x89_d3_2b_e0, 0x10_da_7a_5a,
  0x67_dd_4a_cc, 0xf9_b9_df_6f, 0x8e_be_ef_f9, 0x17_b7_be_43, 0x60_b0_8e_d5,
  0xd6_d6_a3_e8, 0xa1_d1_93_7e, 0x38_d8_c2_c4, 0x4f_df_f2_52, 0xd1_bb_67_f1,
  0xa6_bc_57_67, 0x3f_b5_06_dd, 0x48_b2_36_4b, 0xd8_0d_2b_da, 0xaf_0a_1b_4c,
  0x36_03_4a_f6, 0x41_04_7a_60, 0xdf_60_ef_c3, 0xa8_67_df_55, 0x31_6e_8e_ef,
  0x46_69_be_79, 0xcb_61_b3_8c, 0xbc_66_83_1a, 0x25_6f_d2_a0, 0x52_68_e2_36,
  0xcc_0c_77_95, 0xbb_0b_47_03, 0x22_02_16_b9, 0x55_05_26_2f, 0xc5_ba_3b_be,
  0xb2_bd_0b_28, 0x2b_b4_5a_92, 0x5c_b3_6a_04, 0xc2_d7_ff_a7, 0xb5_d0_cf_31,
  0x2c_d9_9e_8b, 0x5b_de_ae_1d, 0x9b_64_c2_b0, 0xec_63_f2_26, 0x75_6a_a3_9c,
  0x02_6d_93_0a, 0x9c_09_06_a9, 0xeb_0e_36_3f, 0x72_07_67_85, 0x05_00_57_13,
  0x95_bf_4a_82, 0xe2_b8_7a_14, 0x7b_b1_2b_ae, 0x0c_b6_1b_38, 0x92_d2_8e_9b,
  0xe5_d5_be_0d, 0x7c_dc_ef_b7, 0x0b_db_df_21, 0x86_d3_d2_d4, 0xf1_d4_e2_42,
  0x68_dd_b3_f8, 0x1f_da_83_6e, 0x81_be_16_cd, 0xf6_b9_26_5b, 0x6f_b0_77_e1,
  0x18_b7_47_77, 0x88_08_5a_e6, 0xff_0f_6a_70, 0x66_06_3b_ca, 0x11_01_0b_5c,
  0x8f_65_9e_ff, 0xf8_62_ae_69, 0x61_6b_ff_d3, 0x16_6c_cf_45, 0xa0_0a_e2_78,
  0xd7_0d_d2_ee, 0x4e_04_83_54, 0x39_03_b3_c2, 0xa7_67_26_61, 0xd0_60_16_f7,
  0x49_69_47_4d, 0x3e_6e_77_db, 0xae_d1_6a_4a, 0xd9_d6_5a_dc, 0x40_df_0b_66,
  0x37_d8_3b_f0, 0xa9_bc_ae_53, 0xde_bb_9e_c5, 0x47_b2_cf_7f, 0x30_b5_ff_e9,
  0xbd_bd_f2_1c, 0xca_ba_c2_8a, 0x53_b3_93_30, 0x24_b4_a3_a6, 0xba_d0_36_05,
  0xcd_d7_06_93, 0x54_de_57_29, 0x23_d9_67_bf, 0xb3_66_7a_2e, 0xc4_61_4a_b8,
  0x5d_68_1b_02, 0x2a_6f_2b_94, 0xb4_0b_be_37, 0xc3_0c_8e_a1, 0x5a_05_df_1b,
  0x2d_02_ef_8d,
] as const;

export function crc32(str: string): number {
  let count = str.length;
  let crc = 0xff_ff_ff_ff;
  let i = 1;

  while (count > 0) {
    const byte = string.byte(str, i);
    const left = crc >>> 8;
    const crcIndex = ((crc & 0xff) ^ byte) + 1;
    const right = CRC32[crcIndex] ?? 0;
    crc = left ^ right;
    i++;
    count--;
  }
  crc ^= 0xff_ff_ff_ff;

  return crc;
}
