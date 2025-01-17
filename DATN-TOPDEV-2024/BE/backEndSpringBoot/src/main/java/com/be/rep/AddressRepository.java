package com.be.rep;

import com.be.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    @Query("SELECT a FROM Address a WHERE a.user.userId = :userId AND a.defaults = true")
    Optional<Address> findByUserIdAndDefaultsTrue(@Param("userId") Long userId);

    @Query("SELECT a FROM Address a WHERE a.user.userId = :userId")
    List<Address> findByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Address a SET a.defaults = false WHERE a.user.userId = :userId AND a.idAddress != :addressId")
    void updateAllDefaultAddressesToFalse(@Param("userId") Long userId, @Param("addressId") Long addressId);



    @Query("SELECT a.idAddress FROM Address a WHERE a.idAddress = :addressId")
    Long findIdByAddressId(@Param("addressId") Long addressId);

}
