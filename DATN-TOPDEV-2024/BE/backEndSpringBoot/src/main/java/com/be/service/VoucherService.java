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

    public List<Voucher> getVouchersByUserId(Long userId) {
        return voucherRepository.findByUserId(userId);
    }
}
