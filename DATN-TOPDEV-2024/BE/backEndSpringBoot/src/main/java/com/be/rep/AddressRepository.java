package com.be.rep;


import com.be.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {
//    Optional<Address> findByUserIdAndDefaultsTrue(Long userId);
//@Query("SELECT a FROM Address a INNER JOIN a.user u WHERE u.userId = :userId AND a.defaults = true")
//Optional<Address> findByUserIdAndDefaultsTrue(@Param("userId") Long userId);

    @Query("SELECT a FROM Address a WHERE a.user.userId = :userId AND a.defaults = true")
    Optional<Address> findByUserIdAndDefaultsTrue(@Param("userId") Long userId);

    @Query("SELECT a FROM Address a WHERE a.user.userId = :userId")
    List<Address> findByUserId(@Param("userId") Long userId);



//    @Query(value = "SELECT * FROM Address a WHERE a.id_user = :userId AND a.defaults = true", nativeQuery = true)
//    Optional<Address> findByUserIdAndDefaultsTrue(@Param("userId") Long userId);

}

