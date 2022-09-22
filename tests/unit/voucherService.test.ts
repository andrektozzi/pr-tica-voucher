import { jest } from "@jest/globals";
import { Voucher } from "@prisma/client";
import voucherRepository from "../../src/repositories/voucherRepository";
import voucherService from "../../src/services/voucherService";

describe("vocherService test unit", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });    

    it("voucher já existe", async() => {
        const voucher: Voucher = {
            id: 1,
            code: '123',
            discount: 10,
            used: false,
          };
          jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(voucher);
          jest.spyOn(voucherRepository, "createVoucher").mockResolvedValueOnce(voucher);
          await expect(voucherService.createVoucher(voucher.code, voucher.discount)).rejects.toEqual({
            message: "Voucher already exist.",
            type: "conflict",
        });
    });

    it("deve criar um voucher", async () => {
        const voucher: Voucher = {
            id: 2,
            code: '1234',
            discount: 20,
            used: false,
          };
        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(null);
        await voucherService.createVoucher(voucher.code, voucher.discount);

        expect(voucherRepository.createVoucher).toBeCalledTimes(1);
    });

    it("deve aplicar voucher de 10%", async () => {
        const voucher: Voucher = {
            id: 1,
            code: '123',
            discount: 10,
            used: false,
          };
      
        const voucherUsed: Voucher = {
            id: 1,
            code: '123',
            discount: 10,
            used: true,
        };
        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(voucher);
        jest.spyOn(voucherRepository, "useVoucher").mockResolvedValueOnce(voucherUsed);

        const result = await voucherService.applyVoucher(voucher.code, 200);

        expect(voucherRepository.useVoucher).toBeCalled;
        expect(result).toMatchObject({amount: 200, 
            discount: voucher.discount, 
            finalAmount: (200 - (200 * (voucher.discount / 100))), 
            applied: true})
    });

    it("voucher não existe", async () => {
        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(null);
        jest.spyOn(voucherRepository, "useVoucher").mockResolvedValueOnce(null);

        expect(voucherService.applyVoucher).rejects.toEqual({
          message: "Voucher does not exist.",
          type: "conflict",
        });
    });
});