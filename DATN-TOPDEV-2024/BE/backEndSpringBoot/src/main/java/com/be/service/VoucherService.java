package com.be.service;

import com.be.entity.Voucher;
import com.be.rep.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    public Voucher getVoucherById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found with id: " + id));
    }

    public Voucher createVoucher(Voucher voucher) {
        return voucherRepository.save(voucher);
    }

    public Voucher updateVoucher(Long id, Voucher voucherDetails) {
        Voucher voucher = getVoucherById(id);

        voucher.setCode(voucherDetails.getCode());
        voucher.setStartDate(voucherDetails.getStartDate());
        voucher.setEndDate(voucherDetails.getEndDate());
        voucher.setDiscount(voucherDetails.getDiscount());
        voucher.setQuantity(voucherDetails.getQuantity());
        voucher.setStatus(voucherDetails.getStatus());

        return voucherRepository.save(voucher);
    }

    public Voucher deactivateVoucher(Long id) {
        Voucher voucher = getVoucherById(id);
        voucher.setStatus("hethoatdong");
        return voucherRepository.save(voucher);
    }

    public Voucher getVoucherByCode(String code) {
        return voucherRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Voucher not found with code: " + code));
    }
}